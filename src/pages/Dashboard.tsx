import './Dashboard.css';

export function Dashboard() {
    return (
        <div className="dashboard-page">
            <div className="recommended-categories">
                <h3>Categorias Recomendadas</h3>
                <div className="categories-grid">
                    <div className="category-card"><span className="icon">🏠</span> Home Help</div>
                    <div className="category-card"><span className="icon">🔍</span> Plan an event</div>
                    <div className="category-card"><span className="icon">📦</span> Return a package</div>
                    <div className="category-card"><span className="icon">🎁</span> Send a gift</div>
                    <div className="category-card"><span className="icon">📅</span> Schedule an appointment</div>
                    <div className="category-card"><span className="icon">📄</span> Get a passport</div>
                    <div className="category-card"><span className="icon">🎭</span> Find a kids activity</div>
                    <div className="category-card"><span className="icon">✈️</span> Plan a trip</div>
                </div>
            </div>
        </div>
    );
}
