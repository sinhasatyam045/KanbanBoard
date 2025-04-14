import KanbanBoard from "./components/KanbanBoard/KanbanBoard";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <nav className="app-nav">
          <div className="app-logo">TaskFlow</div>
          <div className="app-nav-links">
            <a href="#" className="nav-link active">Board</a>
            <a href="#" className="nav-link">Timeline</a>
            <a href="#" className="nav-link">Reports</a>
          </div>
        </nav>
      </header>
      <main className="app-main">
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;