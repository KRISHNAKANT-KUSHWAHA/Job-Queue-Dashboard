import { useState, useEffect } from 'react';
import { getJobs, createJob, updateJobStatus, deleteJob } from './services/jobApi';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import StatusFilter from './components/StatusFilter';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // Load all jobs from backend
  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getJobs('all');
      setJobs(response.data);
    } catch (err) {
      setError('Failed to connect to backend server. Is it running on port 3000?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Handler to create a new job
  const handleCreateJob = async (jobData) => {
    setError('');
    try {
      await createJob(jobData);
      await loadJobs();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create job';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      throw err;
    }
  };

  // Handler to update job status (with 409 conflict detection)
  const handleUpdateStatus = async (id, newStatus) => {
    setError('');
    try {
      await updateJobStatus(id, newStatus);
      await loadJobs();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('This job was updated by another user. Refreshing...');
        setTimeout(() => {
          loadJobs();
        }, 1200);
      } else {
        const msg = err.response?.data?.message || 'Failed to update job status';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    }
  };

  // Handler to delete a job
  const handleDeleteJob = async (id) => {
    setError('');
    try {
      await deleteJob(id);
      await loadJobs();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete job';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  // Calculate status counts directly from the jobs list
  const pendingCount = jobs.filter((j) => j.status === 'pending').length;
  const runningCount = jobs.filter((j) => j.status === 'running').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const failedCount = jobs.filter((j) => j.status === 'failed').length;

  // Filter jobs for display based on selected filter
  const displayedJobs =
    filter === 'all'
      ? jobs
      : jobs.filter((job) => job.status === filter);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Job Queue Dashboard</h1>
        <p className="app-subtitle">Manage and monitor your background jobs</p>
      </header>

      {/* Status Counters */}
      <section className="status-counters">
        <div
          className={`counter-card counter-pending ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
        >
          <span className="counter-label">Pending</span>
          <span className="counter-value">{pendingCount}</span>
        </div>
        <div
          className={`counter-card counter-running ${filter === 'running' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'running' ? 'all' : 'running')}
        >
          <span className="counter-label">Running</span>
          <span className="counter-value">{runningCount}</span>
        </div>
        <div
          className={`counter-card counter-completed ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'completed' ? 'all' : 'completed')}
        >
          <span className="counter-label">Completed</span>
          <span className="counter-value">{completedCount}</span>
        </div>
        <div
          className={`counter-card counter-failed ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter(filter === 'failed' ? 'all' : 'failed')}
        >
          <span className="counter-label">Failed</span>
          <span className="counter-value">{failedCount}</span>
        </div>
      </section>

      {/* Global Error Alert */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="alert-close-btn" onClick={() => setError('')}>
            ✕
          </button>
        </div>
      )}

      {/* Create Job Form */}
      <section className="card">
        <JobForm onJobCreated={handleCreateJob} />
      </section>

      {/* Filter and Jobs Table Section */}
      <section className="card list-section">
        <div className="list-toolbar">
          <h2>Jobs ({displayedJobs.length})</h2>
          <div className="toolbar-actions">
            <StatusFilter filter={filter} onFilterChange={setFilter} />
            <button className="btn btn-secondary btn-refresh" onClick={loadJobs} title="Refresh jobs">
              ↻ Refresh
            </button>
          </div>
        </div>

        <JobList
          jobs={displayedJobs}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
          onDeleteJob={handleDeleteJob}
        />
      </section>
    </div>
  );
}

export default App;
