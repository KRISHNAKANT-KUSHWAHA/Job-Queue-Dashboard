function JobList({ jobs, loading, onUpdateStatus, onDeleteJob }) {
  if (loading) {
    return <div className="status-message">Loading jobs...</div>;
  }

  if (!jobs || jobs.length === 0) {
    return <div className="status-message">No jobs found.</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="table-responsive">
      <table className="job-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>#{job.id}</td>
              <td className="job-title-cell">{job.title}</td>
              <td>
                <span className="type-badge">{job.type}</span>
              </td>
              <td>
                <span className={`status-badge status-${job.status}`}>
                  {job.status}
                </span>
              </td>
              <td className="timestamp-cell">{formatDate(job.createdAt)}</td>
              <td className="actions-cell">
                {/* Pending Actions */}
                {job.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-action btn-run"
                      onClick={() => onUpdateStatus(job.id, 'running')}
                    >
                      Run
                    </button>
                    <button
                      className="btn btn-action btn-fail"
                      onClick={() => onUpdateStatus(job.id, 'failed')}
                    >
                      Fail
                    </button>
                  </>
                )}

                {/* Running Actions */}
                {job.status === 'running' && (
                  <>
                    <button
                      className="btn btn-action btn-complete"
                      onClick={() => onUpdateStatus(job.id, 'completed')}
                    >
                      Complete
                    </button>
                    <button
                      className="btn btn-action btn-fail"
                      onClick={() => onUpdateStatus(job.id, 'failed')}
                    >
                      Fail
                    </button>
                  </>
                )}

                {/* All statuses allow Delete */}
                <button
                  className="btn btn-action btn-delete"
                  onClick={() => onDeleteJob(job.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;
