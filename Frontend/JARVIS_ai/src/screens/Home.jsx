import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import axios from "../config/axios.js";
import { useNavigate } from 'react-router-dom';
import { FiUser, FiZap, FiPlusCircle } from "react-icons/fi";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(null);
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  function createProject(e) {
    e.preventDefault();
    axios.post('/projects/create', { name: projectName })
      .then(res => setIsModalOpen(false))
      .catch(err => console.log(err));
  }

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    axios.get('/projects/all')
      .then(res => setProject(res.data.projects))
      .catch(err => console.log(err));
  }, []);

  const steps = [
    { icon: <FiUser className="text-purple-600 w-6 h-6" />, text: "Sign up – Create your account to get started." },
    { icon: <FiPlusCircle className="text-pink-500 w-6 h-6" />, text: "Create a project – Add a new project to organize your work." },
    { icon: <FiZap className="text-red-500 w-6 h-6" />, text: "Open the project – Click on your project to start working." },
    { icon: <FiZap className="text-yellow-500 w-6 h-6" />, text: "Call the AI – Type @ai in the project chat to interact with the AI assistant." },
     { icon: <FiZap className="text-blue-500 w-6 h-6" />, text: "If something went wrong please refresh the page" },
  ];

  return (
    <main className="min-h-screen p-10 bg-gray-100 font-sans text-gray-900">

      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800">Welcome, {user?.email}</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-lg"
          >
            <FiPlusCircle className="w-5 h-5" /> New Project
          </button>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <section className="flex flex-col md:flex-row gap-10">
        {/* Left: Projects */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-wide">Your Projects</h2>
          <div className="projects grid grid-cols-1 sm:grid-cols-2 gap-6">
            {project.map(proj => (
              <div
                key={proj._id}
                onClick={() => navigate(`/project`, { state: { project: proj } })}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-xl hover:scale-105 transition-all cursor-pointer flex flex-col gap-4"
              >
                <h2 className="text-xl md:text-2xl font-bold mb-2">{proj.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                  <FiUser className="w-5 h-5" />
                  <span>{proj.users.length} Collaborators</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: How It Works Card */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg w-full max-w-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">How It Works</h2>
            <ul className="flex flex-col gap-6">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="mt-1">{step.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">Step {index + 1}</h3>
                    <p className="text-gray-700 text-sm md:text-base">{step.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Project Name</label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  placeholder="Enter project name"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-base"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:scale-105 transition-transform text-base"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
};

export default Home;
