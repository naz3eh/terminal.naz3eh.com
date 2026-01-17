import { useConfig } from './hooks/useConfig';
import { Terminal } from './components/Terminal';
import './App.css';

function App() {
  const { config, loading, error } = useConfig();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">
          <span className="blink">█</span> Initializing...
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="error-screen">
        <div className="error-text">
          ERROR: Failed to load configuration
          <br />
          <span className="error-detail">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Terminal config={config} />
    </div>
  );
}

export default App;
