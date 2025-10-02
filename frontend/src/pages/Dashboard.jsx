import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, testConnection, testAuth, testTasksAPI } from '../services/api';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import SearchFilter from '../components/SearchFilter';
import StatsCard from '../components/StatsCard';
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Settings,
  Bug
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    console.log('🔄 Dashboard mounted, fetching tasks...');
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching tasks...');
      console.log('📡 Fetching tasks with filters:', filters);
      
      const response = await tasksAPI.getAll(filters);
      console.log('✅ Tasks API response:', response.data);
      
      const tasksData = response.data.data?.tasks || [];
      setTasks(tasksData);
      setPagination(response.data.data?.pagination || {});
      
      setDebugInfo(`✅ Loaded ${tasksData.length} tasks successfully`);
      console.log(`✅ Set ${tasksData.length} tasks to state`);
      
    } catch (error) {
      console.error('❌ Failed to fetch tasks:', error);
      console.error('Error response:', error.response?.data);
      setTasks([]);
      setDebugInfo(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      console.log('🔄 Creating task:', taskData);
      setDebugInfo('Creating task...');
      
      const response = await tasksAPI.create(taskData);
      console.log('✅ Task created successfully:', response.data);
      
      setShowTaskForm(false);
      setDebugInfo('✅ Task created successfully!');
      
      // Refresh the task list
      await fetchTasks();
      
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      console.error('Error details:', error.response?.data);
      setDebugInfo(`❌ Failed to create task: ${error.response?.data?.message || error.message}`);
      return Promise.reject(error);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      console.log('🔄 Updating task:', taskId, taskData);
      setDebugInfo('Updating task...');
      
      const response = await tasksAPI.update(taskId, taskData);
      console.log('✅ Task updated successfully:', response.data);
      
      setEditingTask(null);
      setShowTaskForm(false);
      setDebugInfo('✅ Task updated successfully!');
      
      await fetchTasks();
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      setDebugInfo(`❌ Failed to update task: ${error.response?.data?.message || error.message}`);
      return Promise.reject(error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      console.log('🔄 Deleting task:', taskId);
      setDebugInfo('Deleting task...');
      
      await tasksAPI.delete(taskId);
      console.log('✅ Task deleted successfully');
      setDebugInfo('✅ Task deleted successfully!');
      
      await fetchTasks();
      
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      setDebugInfo(`❌ Failed to delete task: ${error.response?.data?.message || error.message}`);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    console.log('✏️ Editing task:', task);
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔍 Filter changed:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    console.log('📄 Page changed:', newPage);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh');
    setDebugInfo('Refreshing...');
    fetchTasks();
  };

  const handleRunTests = async () => {
    console.log('🧪 Running API tests...');
    setDebugInfo('Running API tests...');
    
    // Test backend connection
    const connectionResult = await testConnection();
    if (!connectionResult.success) {
      setDebugInfo('❌ Backend connection failed');
      return;
    }
    
    // Test authentication
    const authResult = await testAuth();
    if (!authResult.success) {
      setDebugInfo('❌ Authentication failed');
      return;
    }
    
    // Test tasks API
    const tasksResult = await testTasksAPI();
    if (!tasksResult.success) {
      setDebugInfo('❌ Tasks API failed');
      return;
    }
    
    setDebugInfo('✅ All API tests passed!');
  };

  const handleQuickTask = () => {
    const quickTask = {
      title: `Quick Task ${new Date().toLocaleTimeString()}`,
      description: 'This is a quick test task',
      status: 'pending',
      priority: 'medium'
    };
    
    handleCreateTask(quickTask).then(() => {
      console.log('✅ Quick task created');
    }).catch(error => {
      console.error('❌ Failed to create quick task:', error);
    });
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
  };

  console.log('📊 Dashboard State:', {
    tasks: tasks.length,
    loading,
    filters,
    user: user?.email
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Debug Info */}
      {showDebug && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bug className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Debug Information
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700 space-y-1">
                    <p><strong>Status:</strong> {debugInfo || 'Ready'}</p>
                    <p><strong>Tasks in state:</strong> {tasks.length}</p>
                    <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                    <p><strong>User:</strong> {user?.email}</p>
                    <p><strong>Filters:</strong> {JSON.stringify(filters)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRunTests}
                  className="btn btn-secondary text-xs"
                >
                  Test APIs
                </button>
                <button
                  onClick={handleQuickTask}
                  className="btn btn-secondary text-xs"
                >
                  Quick Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-0">
          <StatsCard
            title="Total Tasks"
            value={stats.total}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={AlertCircle}
            color="red"
          />
        </div>

        <div className="px-4 sm:px-0">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <p className="text-sm text-gray-600">
                Manage your tasks efficiently {tasks.length > 0 && `(${tasks.length} tasks found)`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <SearchFilter
                filters={filters}
                onFilterChange={handleFilterChange}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="btn btn-primary flex items-center gap-2 justify-center"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </button>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="card">
            <TaskList
              tasks={tasks}
              loading={loading}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Empty State Help */}
         
        </div>
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask._id, data) : 
            handleCreateTask
          }
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-700">Loading tasks...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;