import React from 'react';
import { Calendar } from 'lucide-react';
import './Events.css';

const Events = () => {
  return (
    <div className="events-page">
      <div className="page-header">
        <h1>Events</h1>
        <p>Manage campus and online events</p>
      </div>
      <div className="coming-soon">
        <Calendar size={48} />
        <h2>Event Management Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};

export default Events;