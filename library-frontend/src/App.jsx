
import { useEffect, useState } from 'react';
import {
  BookOpen, Users, ArrowLeftRight, LayoutDashboard, Plus, Search,
  Pencil, Trash2, RotateCcw, RefreshCw, Menu, X, Library,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { get, post, put, del } from './api';

const emptyBook = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  totalCopies: 1
};

const emptyMember = {
  fullName: '',
  email: '',
  phone: ''
};

const localDate = d => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = () => localDate(new Date());

const datePlus = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localDate(d);
};

const getId = x => x?.id ?? x?.bookId ?? x?.memberId;

const bookName = x =>
    x?.title || x?.bookTitle || x?.name || 'Unknown book';

const memberName = x =>
    x?.fullName || x?.name || x?.memberName || 'Unknown member';

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        get('/books'),
        get('/members'),
        get('/loans'),
        get('/dashboard')
      ]);

      const [b, m, l, d] = results;

      if (b.status === 'rejected') throw b.reason;

      setBooks(
          Array.isArray(b.value)
              ? b.value
              : b.value?.content || []
      );

      setMembers(
          m.status === 'fulfilled'
              ? (Array.isArray(m.value) ? m.value : m.value?.content || [])
              : []
      );

      setLoans(
          l.status === 'fulfilled'
              ? (Array.isArray(l.value) ? l.value : l.value?.content || [])
              : []
      );

      setDashboard(d.status === 'fulfilled' ? (d.value || {}) : {});
      setConnected(true);

    } catch (e) {
      setConnected(false);
      setError(e.message || 'Could not connect to the backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const notify = msg => {
    setNotice(msg);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const run = async (work, success) => {
    setSaving(true);
    setError('');

    try {
      await work();
      await refresh();
      setModal(null);
      notify(success);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const nav = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Books', icon: BookOpen },
    { name: 'Members', icon: Users },
    { name: 'Borrow & Return', icon: ArrowLeftRight }
  ];

  const filtered = list =>
      list.filter(x =>
          JSON.stringify(x).toLowerCase().includes(search.toLowerCase())
      );

  const openBook = book => {
    setError('');
    setModal({ type: 'book', item: book || emptyBook });
  };

  const openMember = member => {
    setError('');
    setModal({ type: 'member', item: member || emptyMember });
  };

  // The backend owns available-copy counts and maintains them during edits.
  async function saveBook(form) {
    const total = Number(form.totalCopies);

    const body = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      category: form.category.trim(),
      totalCopies: total
    };

    await run(
        () =>
            form.id
                ? put(`/books/${form.id}`, body)
                : post('/books', body),
        form.id ? 'Book updated.' : 'Book added.'
    );
  }

  async function saveMember(form) {
    const body = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim()
    };

    await run(
        () =>
            form.id
                ? put(`/members/${form.id}`, body)
                : post('/members', body),
        form.id ? 'Member updated.' : 'Member added.'
    );
  }

  async function removeBook(book) {
    if (window.confirm(`Delete “${bookName(book)}”?`)) {
      await run(
          () => del(`/books/${getId(book)}`),
          'Book deleted.'
      );
    }
  }

  async function removeMember(member) {
    if (window.confirm(`Delete “${memberName(member)}”?`)) {
      await run(
          () => del(`/members/${getId(member)}`),
          'Member deleted.'
      );
    }
  }

  async function issue(form) {
    await run(
        () =>
            post('/loans/issue', {
              bookId: Number(form.bookId),
              memberId: Number(form.memberId),
              dueDate: form.dueDate
            }),
        'Book issued successfully.'
    );
  }

  async function returnLoan(loan) {
    if (window.confirm('Mark this loan as returned?')) {
      await run(
          () => post(`/loans/${getId(loan)}/return`, {}),
          'Book marked as returned.'
      );
    }
  }

  const isReturned = loan =>
      Boolean(
          loan.returnDate ||
          loan.returned ||
          String(loan.status || '').toLowerCase() === 'returned'
      );

  const overdue = loan =>
      !isReturned(loan) &&
      loan.dueDate &&
      new Date(`${loan.dueDate}T23:59:59`) < new Date();

  const totalCopies = books.reduce(
      (s, b) => s + Number(b.totalCopies || 0),
      0
  );

  const issuedCount = loans.filter(l => !isReturned(l)).length;
  const overdueCount = loans.filter(overdue).length;

  const stats = [
    {
      label: 'Book titles',
      value: dashboard.totalBooks ?? books.length,
      icon: BookOpen,
      tone: 'blue'
    },
    {
      label: 'Total members',
      value: dashboard.totalMembers ?? members.length,
      icon: Users,
      tone: 'purple'
    },
    {
      label: 'Books issued',
      value: dashboard.issuedBooks ?? issuedCount,
      icon: ArrowLeftRight,
      tone: 'orange'
    },
    {
      label: 'Overdue loans',
      value: dashboard.overdueBooks ?? overdueCount,
      icon: AlertCircle,
      tone: 'red'
    }
  ];

  return (
      <div className="app-shell">
        <aside className={`sidebar ${mobileNav ? 'show' : ''}`}>
          <div className="brand">
            <div className="brand-mark">
              <Library size={22} />
            </div>

            <div>
              <strong>PageTurn</strong>
              <span>LIBRARY SYSTEM</span>
            </div>

            <button
                className="mobile-close"
                onClick={() => setMobileNav(false)}
            >
              <X />
            </button>
          </div>

          <div className="nav-label">WORKSPACE</div>

          <nav>
            {nav.map(item => (
                <button
                    key={item.name}
                    className={`nav-item ${page === item.name ? 'active' : ''}`}
                    onClick={() => {
                      setPage(item.name);
                      setSearch('');
                      setMobileNav(false);
                    }}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>

                  {item.name === 'Borrow & Return' && (
                      <span className="nav-count">{issuedCount}</span>
                  )}
                </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className={`connection ${connected ? 'online' : 'offline'}`}>
              <span className="dot" />

              <div>
                <b>
                  {connected ? 'Backend connected' : 'Backend disconnected'}
                </b>
                <small>
                  {connected ? 'API is responding' : 'Check Spring Boot server'}
                </small>
              </div>
            </div>

            <div className="sidebar-foot">
              Library Management System <span>v1.0</span>
            </div>
          </div>
        </aside>

        {mobileNav && (
            <button
                className="scrim"
                onClick={() => setMobileNav(false)}
                aria-label="Close navigation"
            />
        )}

        <main className="main-area">
          <header className="topbar">
            <button
                className="menu-button"
                onClick={() => setMobileNav(true)}
            >
              <Menu />
            </button>

            <div className="breadcrumb">
              Workspace <span>/</span> <b>{page}</b>
            </div>

            <div className="top-actions">
            <span className={`status-pill ${connected ? 'good' : 'bad'}`}>
              <i />
              {connected ? 'Connected' : 'Offline'}
            </span>

              <button
                  className="icon-button"
                  onClick={refresh}
                  title="Refresh"
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </header>

          <div className="content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">LIBRARY MANAGEMENT</div>

                <h1>
                  {page === 'Borrow & Return'
                      ? 'Borrow & Return'
                      : page === 'Books'
                          ? 'Book Catalogue'
                          : page}
                </h1>

                <p>
                  {page === 'Dashboard'
                      ? 'Here is what is happening in your library today.'
                      : page === 'Books'
                          ? 'Manage your collection, copies and book details.'
                          : page === 'Members'
                              ? 'Keep your library member records up to date.'
                              : 'Issue books to members and process returns.'}
                </p>
              </div>

              <button
                  className="primary-button"
                  onClick={() =>
                      page === 'Books'
                          ? openBook(null)
                          : page === 'Members'
                              ? openMember(null)
                              : page === 'Borrow & Return'
                                  ? setModal({ type: 'issue' })
                                  : refresh()
                  }
              >
                {page === 'Books' ||
                page === 'Members' ||
                page === 'Borrow & Return' ? (
                    <>
                      <Plus size={17} />
                      {page === 'Books'
                          ? 'Add book'
                          : page === 'Members'
                              ? 'Add member'
                              : 'Issue a book'}
                    </>
                ) : (
                    <>
                      <RefreshCw size={16} />
                      Refresh data
                    </>
                )}
              </button>
            </div>

            {error && (
                <div className="alert error">
                  <AlertCircle size={17} />
                  <span>{error}</span>
                  <button onClick={() => setError('')}>
                    <X size={16} />
                  </button>
                </div>
            )}

            {notice && (
                <div className="alert success">
                  <CheckCircle2 size={17} />
                  {notice}
                </div>
            )}

            {!connected && !loading && (
                <div className="alert warning">
                  Start your Spring Boot backend on port 8080, then press refresh.
                  Your frontend is ready but cannot reach the API.
                </div>
            )}

            {loading ? (
                <div className="loading">
                  <span className="spinner" />
                  Loading library data…
                </div>
            ) : (
                <>
                  {page === 'Dashboard' && (
                      <>
                        <div className="stats-grid">
                          {stats.map(s => (
                              <div className="stat-card" key={s.label}>
                                <div className={`stat-icon ${s.tone}`}>
                                  <s.icon size={20} />
                                </div>

                                <div>
                                  <span>{s.label}</span>
                                  <strong>{s.value}</strong>
                                </div>
                              </div>
                          ))}
                        </div>

                        <div className="dashboard-grid">
                          <section className="panel">
                            <div className="panel-head">
                              <div>
                                <h2>Recent activity</h2>
                                <p>Latest borrowing records</p>
                              </div>

                              <button
                                  className="text-button"
                                  onClick={() => setPage('Borrow & Return')}
                              >
                                View all
                              </button>
                            </div>

                            <LoanTable
                                loans={loans.slice(0, 6)}
                                isReturned={isReturned}
                                overdue={overdue}
                                onReturn={returnLoan}
                            />
                          </section>

                          <section className="panel quick-panel">
                            <div className="panel-head">
                              <div>
                                <h2>Quick actions</h2>
                                <p>Common library tasks</p>
                              </div>
                            </div>

                            <button
                                className="quick-action"
                                onClick={() => openBook(null)}
                            >
                        <span className="quick-icon blue">
                          <BookOpen />
                        </span>
                              <span>
                          <b>Add a new book</b>
                          <small>Add a title to your catalogue</small>
                        </span>
                              <Plus size={17} />
                            </button>

                            <button
                                className="quick-action"
                                onClick={() => openMember(null)}
                            >
                        <span className="quick-icon purple">
                          <Users />
                        </span>
                              <span>
                          <b>Register a member</b>
                          <small>Create a member record</small>
                        </span>
                              <Plus size={17} />
                            </button>

                            <button
                                className="quick-action"
                                onClick={() => setModal({ type: 'issue' })}
                            >
                        <span className="quick-icon orange">
                          <ArrowLeftRight />
                        </span>
                              <span>
                          <b>Issue a book</b>
                          <small>Record a new borrowing</small>
                        </span>
                              <Plus size={17} />
                            </button>

                            <div className="collection-note">
                              <b>{totalCopies}</b>
                              <span>
                          physical copies across <b>{books.length}</b> book
                          titles
                        </span>
                            </div>
                          </section>
                        </div>
                      </>
                  )}

                  {page === 'Books' && (
                      <section className="panel table-panel">
                        <div className="panel-head">
                          <div>
                            <h2>
                              All books{' '}
                              <span className="count-chip">
                          {filtered(books).length}
                        </span>
                            </h2>
                            <p>Search, update or remove catalogue entries</p>
                          </div>

                          <SearchBox
                              value={search}
                              onChange={setSearch}
                              placeholder="Search books…"
                          />
                        </div>

                        <div className="table-wrap">
                          <table>
                            <thead>
                            <tr>
                              <th>BOOK</th>
                              <th>AUTHOR</th>
                              <th>ISBN</th>
                              <th>CATEGORY</th>
                              <th>COPIES</th>
                              <th className="right">ACTIONS</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filtered(books).map(book => (
                                <tr key={getId(book)}>
                                  <td>
                                    <div className="book-cell">
                                <span className="book-cover">
                                  <BookOpen size={17} />
                                </span>
                                      <b>{bookName(book)}</b>
                                    </div>
                                  </td>

                                  <td>{book.author || '—'}</td>
                                  <td>{book.isbn || '—'}</td>

                                  <td>
                              <span className="category-tag">
                                {book.category || 'General'}
                              </span>
                                  </td>

                                  <td>
                                    <b>
                                      {book.availableCopies ?? book.available ?? '—'}
                                    </b>
                                    <span className="muted">
                                {' '}
                                      / {book.totalCopies ?? '—'}
                              </span>
                                  </td>

                                  <td>
                                    <div className="actions">
                                      <button
                                          title="Edit"
                                          onClick={() => openBook(book)}
                                      >
                                        <Pencil size={16} />
                                      </button>

                                      <button
                                          title="Delete"
                                          className="danger-icon"
                                          onClick={() => removeBook(book)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>

                          {filtered(books).length === 0 && (
                              <Empty text="No books found. Add your first book to get started." />
                          )}
                        </div>
                      </section>
                  )}

                  {page === 'Members' && (
                      <section className="panel table-panel">
                        <div className="panel-head">
                          <div>
                            <h2>
                              Library members{' '}
                              <span className="count-chip">
                          {filtered(members).length}
                        </span>
                            </h2>
                            <p>Manage registered member information</p>
                          </div>

                          <SearchBox
                              value={search}
                              onChange={setSearch}
                              placeholder="Search members…"
                          />
                        </div>

                        <div className="table-wrap">
                          <table>
                            <thead>
                            <tr>
                              <th>MEMBER</th>
                              <th>EMAIL</th>
                              <th>PHONE</th>
                              <th>MEMBER ID</th>
                              <th className="right">ACTIONS</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filtered(members).map(member => (
                                <tr key={getId(member)}>
                                  <td>
                                    <div className="member-cell">
                                <span className="avatar">
                                  {memberName(member).slice(0, 1).toUpperCase()}
                                </span>
                                      <b>{memberName(member)}</b>
                                    </div>
                                  </td>

                                  <td>{member.email || '—'}</td>
                                  <td>{member.phone || '—'}</td>
                                  <td>#{getId(member)}</td>

                                  <td>
                                    <div className="actions">
                                      <button
                                          title="Edit"
                                          onClick={() => openMember(member)}
                                      >
                                        <Pencil size={16} />
                                      </button>

                                      <button
                                          title="Delete"
                                          className="danger-icon"
                                          onClick={() => removeMember(member)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>

                          {filtered(members).length === 0 && (
                              <Empty text="No members found. Register your first member." />
                          )}
                        </div>
                      </section>
                  )}

                  {page === 'Borrow & Return' && (
                      <section className="panel table-panel">
                        <div className="panel-head">
                          <div>
                            <h2>
                              Loan records{' '}
                              <span className="count-chip">
                          {filtered(loans).length}
                        </span>
                            </h2>
                            <p>Track active loans, due dates and returns</p>
                          </div>

                          <SearchBox
                              value={search}
                              onChange={setSearch}
                              placeholder="Search loans…"
                          />
                        </div>

                        <div className="table-wrap">
                          <LoanTable
                              loans={filtered(loans)}
                              isReturned={isReturned}
                              overdue={overdue}
                              onReturn={returnLoan}
                          />
                        </div>

                        {filtered(loans).length === 0 && (
                            <Empty text="No loan records yet. Issue a book to see it here." />
                        )}
                      </section>
                  )}
                </>
            )}
          </div>
        </main>

        {modal && (
            <Modal
                modal={modal}
                books={books}
                members={members}
                saving={saving}
                onClose={() => setModal(null)}
                onSaveBook={saveBook}
                onSaveMember={saveMember}
                onIssue={issue}
            />
        )}
      </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
      <label className="search-box">
        <Search size={17} />
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
      </label>
  );
}

function Empty({ text }) {
  return (
      <div className="empty-state">
        <BookOpen size={27} />
        <p>{text}</p>
      </div>
  );
}

function LoanTable({ loans, isReturned, overdue, onReturn }) {
  return (
      <table>
        <thead>
        <tr>
          <th>BOOK / MEMBER</th>
          <th>ISSUED</th>
          <th>DUE DATE</th>
          <th>STATUS</th>
          <th className="right">ACTION</th>
        </tr>
        </thead>

        <tbody>
        {loans.map(loan => {
          const returned = isReturned(loan);
          const late = overdue(loan);
          const book = loan.book || {};
          const member = loan.member || {};

          return (
              <tr key={getId(loan)}>
                <td>
                  <div className="loan-book">
                    <b>
                      {bookName(book) !== 'Unknown book'
                          ? bookName(book)
                          : loan.bookTitle || 'Book #' + (loan.bookId ?? '')}
                    </b>

                    <small>
                      {memberName(member) !== 'Unknown member'
                          ? memberName(member)
                          : loan.memberName || 'Member #' + (loan.memberId ?? '')}
                    </small>
                  </div>
                </td>

                <td>{loan.issueDate || loan.borrowDate || '—'}</td>
                <td>{loan.dueDate || '—'}</td>

                <td>
                <span
                    className={`status-tag ${
                        returned ? 'returned' : late ? 'overdue' : 'issued'
                    }`}
                >
                  {returned ? 'Returned' : late ? 'Overdue' : 'Issued'}
                </span>

                  {Number(loan.fineAmount ?? loan.fine ?? 0) > 0 && (
                      <small className="fine">Fine: ₹{loan.fineAmount ?? loan.fine}</small>
                  )}
                </td>

                <td>
                  <div className="actions">
                    {!returned && (
                        <button
                            className="return-button"
                            onClick={() => onReturn(loan)}
                            title="Return book"
                        >
                          <RotateCcw size={15} /> Return
                        </button>
                    )}
                  </div>
                </td>
              </tr>
          );
        })}
        </tbody>
      </table>
  );
}

function Modal({
                 modal,
                 books,
                 members,
                 saving,
                 onClose,
                 onSaveBook,
                 onSaveMember,
                 onIssue
               }) {
  const item = modal.item || {};

  const [form, setForm] = useState(
      modal.type === 'book'
          ? { ...emptyBook, ...item }
          : modal.type === 'member'
              ? { ...emptyMember, ...item }
              : {
                bookId: '',
                memberId: '',
                dueDate: datePlus(14)
              }
  );

  const change = e => {
    setForm(f => ({
      ...f,
      [e.target.name]: e.target.value
    }));
  };

  const submit = e => {
    e.preventDefault();

    if (modal.type === 'book') {
      onSaveBook(form);
    } else if (modal.type === 'member') {
      onSaveMember(form);
    } else {
      onIssue(form);
    }
  };

  const title =
      modal.type === 'book'
          ? item.id ? 'Edit book' : 'Add a book'
          : modal.type === 'member'
              ? item.id ? 'Edit member' : 'Register a member'
              : 'Issue a book';

  return (
      <div
          className="modal-backdrop"
          onMouseDown={e =>
              e.target === e.currentTarget && onClose()
          }
      >
        <form className="modal" onSubmit={submit}>
          <div className="modal-head">
            <div>
              <span className="eyebrow">LIBRARY RECORD</span>
              <h2>{title}</h2>
            </div>

            <button
                type="button"
                className="icon-button"
                onClick={onClose}
            >
              <X />
            </button>
          </div>

          {modal.type === 'book' && (
              <div className="form-grid">
                <Field
                    label="Book title"
                    name="title"
                    value={form.title}
                    onChange={change}
                    required
                />

                <Field
                    label="Author"
                    name="author"
                    value={form.author}
                    onChange={change}
                    required
                />

                <Field
                    label="ISBN"
                    name="isbn"
                    value={form.isbn}
                    onChange={change}
                    required
                />

                <Field
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={change}
                    required
                />

                <Field
                    label="Total copies"
                    name="totalCopies"
                    type="number"
                    min="1"
                    value={form.totalCopies}
                    onChange={change}
                    required
                />
              </div>
          )}

          {modal.type === 'member' && (
              <div className="form-grid">
                <Field
                    label="Full name"
                    name="fullName"
                    value={form.fullName}
                    onChange={change}
                    required
                />

                <Field
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={change}
                    required
                />

                <Field
                    label="Phone number"
                    name="phone"
                    value={form.phone}
                    onChange={change}
                />
              </div>
          )}

          {modal.type === 'issue' && (
              <div className="form-grid">
                <label className="field full">
                  <span>Select book</span>

                  <select
                      name="bookId"
                      value={form.bookId}
                      onChange={change}
                      required
                  >
                    <option value="">Choose a book</option>

                    {books.map(b => (
                        <option
                            key={getId(b)}
                            value={getId(b)}
                            disabled={Number(b.availableCopies ?? b.available ?? 0) < 1}
                        >
                          {bookName(b)} (available:{' '}
                          {b.availableCopies ?? b.available ?? '—'})
                        </option>
                    ))}
                  </select>
                </label>

                <label className="field full">
                  <span>Select member</span>

                  <select
                      name="memberId"
                      value={form.memberId}
                      onChange={change}
                      required
                  >
                    <option value="">Choose a member</option>

                    {members.map(m => (
                        <option key={getId(m)} value={getId(m)}>
                          {memberName(m)} — #{getId(m)}
                        </option>
                    ))}
                  </select>
                </label>

                <Field
                    label="Due date"
                    name="dueDate"
                    type="date"
                    min={today()}
                    value={form.dueDate}
                    onChange={change}
                    required
                />

                <p className="helper full">
                  The selected book and member will be linked to a new loan record. Books with no available copies cannot be issued.
                </p>
              </div>
          )}

          <div className="modal-actions">
            <button
                type="button"
                className="secondary-button"
                onClick={onClose}
            >
              Cancel
            </button>

            <button className="primary-button" disabled={saving}>
              {saving
                  ? 'Saving…'
                  : modal.type === 'issue'
                      ? 'Issue book'
                      : item.id
                          ? 'Save changes'
                          : 'Save record'}
            </button>
          </div>
        </form>
      </div>
  );
}

function Field({
                 label,
                 name,
                 value,
                 onChange,
                 type = 'text',
                 required,
                 min
               }) {
  return (
      <label className="field">
      <span>
        {label}
        {required && ' *'}
      </span>

        <input
            name={name}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            required={required}
            min={min}
        />
      </label>
  );
}
