import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Calendar, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import StockChart from './StockChart';
import './StockPredictor.css';

const StockPredictor = () => {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockData, setStockData] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setError('');
    setStockData(null);
    setPrediction(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/stock/${symbol.toUpperCase()}`);
      setStockData(response.data);

      const predictionResponse = await axios.post('http://localhost:5000/api/predict', {
        symbol: symbol.toUpperCase()
      });
      setPrediction(predictionResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPriceUp = stockData?.change >= 0;

  return (
    <div className="stock-predictor">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="search-section"
      >
        <h2 className="section-title">Stock Price Prediction</h2>
        <p className="section-subtitle">Enter a stock symbol to analyze and predict future prices</p>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
              className="search-input"
              disabled={loading}
            />
          </div>
          <motion.button
            type="submit"
            className="search-button"
            disabled={loading || !symbol.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Search size={20} />
                Predict
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="error-message"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {stockData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="results-container"
          >
            <div className="stock-info-card">
              <div className="stock-header">
                <div>
                  <h3 className="stock-symbol">{stockData.symbol}</h3>
                  <p className="stock-name">{stockData.name || 'Stock Information'}</p>
                </div>
                <div className={`price-badge ${isPriceUp ? 'price-up' : 'price-down'}`}>
                  {isPriceUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  <span>{isPriceUp ? '+' : ''}{stockData.changePercent?.toFixed(2)}%</span>
                </div>
              </div>

              <div className="price-section">
                <div className="current-price">
                  <DollarSign size={28} />
                  <span className="price-value">{stockData.price?.toFixed(2)}</span>
                </div>
                <div className={`price-change ${isPriceUp ? 'positive' : 'negative'}`}>
                  {isPriceUp ? '+' : ''}{stockData.change?.toFixed(2)} USD
                </div>
              </div>

              <div className="stock-details">
                <div className="detail-item">
                  <span className="detail-label">Open</span>
                  <span className="detail-value">${stockData.open?.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">High</span>
                  <span className="detail-value">${stockData.high?.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Low</span>
                  <span className="detail-value">${stockData.low?.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Volume</span>
                  <span className="detail-value">{stockData.volume?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="prediction-card"
              >
                <div className="prediction-header">
                  <Calendar size={24} />
                  <h3>Price Predictions</h3>
                </div>

                <div className="predictions-grid">
                  <div className="prediction-item">
                    <span className="prediction-label">Next Day</span>
                    <span className="prediction-value">${prediction.next_day?.toFixed(2)}</span>
                  </div>
                  <div className="prediction-item">
                    <span className="prediction-label">Next Week</span>
                    <span className="prediction-value">${prediction.next_week?.toFixed(2)}</span>
                  </div>
                  <div className="prediction-item">
                    <span className="prediction-label">Next Month</span>
                    <span className="prediction-value">${prediction.next_month?.toFixed(2)}</span>
                  </div>
                </div>

                {prediction.confidence && (
                  <div className="confidence-section">
                    <span className="confidence-label">Confidence Score</span>
                    <div className="confidence-bar">
                      <motion.div
                        className="confidence-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${prediction.confidence}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                      />
                    </div>
                    <span className="confidence-value">{prediction.confidence}%</span>
                  </div>
                )}
              </motion.div>
            )}

            {stockData.historical && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <StockChart data={stockData.historical} symbol={stockData.symbol} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockPredictor;
