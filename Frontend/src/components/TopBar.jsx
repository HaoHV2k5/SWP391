import { messages } from '../data/homepageData';

const TopBar = () => {
  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        {/* Track lần 1 */}
        {messages.map((msg, i) => (
          <div key={i} className="announcement-text">
            {msg}
          </div>
        ))}
        {/* Track lần 2 để lặp liên tục */}
        {messages.map((msg, i) => (
          <div key={`copy-${i}`} className="announcement-text">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
