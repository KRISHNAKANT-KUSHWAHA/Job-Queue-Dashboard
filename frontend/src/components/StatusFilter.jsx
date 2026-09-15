function StatusFilter({ filter, onFilterChange }) {
  return (
    <div className="status-filter-container">
      <label htmlFor="status-filter">Filter by Status:</label>
      <select
        id="status-filter"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="running">Running</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
}

export default StatusFilter;
