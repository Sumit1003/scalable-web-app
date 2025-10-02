import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const SearchFilter = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value) => {
    onFilterChange({ search: value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      status: "",
      priority: "",
      page: 1,
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.priority;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-secondary flex items-center gap-2 ${
            hasActiveFilters ? "bg-primary-100 text-primary-700" : ""
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn btn-secondary flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="input"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
