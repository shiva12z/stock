import { TrendingUp } from 'lucide-react';
import StockPredictor from './components/StockPredictor';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <TrendingUp className="logo-icon" size={32} />
          <h1 className="logo">StockWise</h1>
        </div>
      </header>
      <main className="main-content">
        <StockPredictor />
      </main>
    </div>
  );
}

export default App;
