import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [alumni, setAlumni] = useState([]);
  const [filters, setFilters] = useState({ graduation_year: '', course: '', company: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlumni = async (filterParams = {}) => {
    try {
      setLoading(true); setError('');
      const params = new URLSearchParams();
      Object.keys(filterParams).forEach(k => filterParams[k] && params.append(k, filterParams[k]));
      const res = await axios.get(`http://localhost:5000/api/alumni?${params.toString()}`);
      setAlumni(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch alumni. Ensure backend is running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAlumni(); }, []);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); fetchAlumni(filters); };
  const handleReset = () => { setFilters({ graduation_year: '', course: '', company: '', location: '' }); fetchAlumni({}); };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-blue-800">Alumni Networking Portal</h1>
        <p className="text-gray-600">Connect with fellow graduates and explore opportunities</p>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Find Alumni</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm">Graduation Year</label>
              <input name="graduation_year" type="number" value={filters.graduation_year} onChange={handleFilterChange} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-sm">Course</label>
              <input name="course" value={filters.course} onChange={handleFilterChange} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-sm">Company</label>
              <input name="company" value={filters.company} onChange={handleFilterChange} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-sm">Location</label>
              <input name="location" value={filters.location} onChange={handleFilterChange} className="w-full p-2 border rounded" /></div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={handleReset} className="px-4 py-2 bg-gray-500 text-white rounded">Reset</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Apply Filters</button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-100 p-3 rounded mb-4 text-red-700">{error}</div>}

      {loading ? (
        <div className="text-center py-8">Loading alumni data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.length > 0 ? alumni.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">{a.name}</h3>
              <div className="text-sm space-y-1">
                <div><strong>Email:</strong> {a.email}</div>
                <div><strong>Class of:</strong> {a.graduation_year}</div>
                <div><strong>Course:</strong> {a.course}</div>
                <div><strong>Role:</strong> {a.current_job}</div>
                <div><strong>Company:</strong> {a.company}</div>
                <div><strong>Location:</strong> {a.location}</div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded">Connect</button>
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded">Message</button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-8 text-gray-600">No alumni found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
