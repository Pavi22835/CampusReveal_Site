import React from 'react';
import { BookOpen } from 'lucide-react';
import './Projects.css';

const Projects = () => {
  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage student innovation projects</p>
      </div>
      <div className="coming-soon">
        <BookOpen size={48} />
        <h2>Project Management Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};

export default Projects;