import { useState } from "react";
import "./TicketCard.styles.css";
import PropTypes from 'prop-types';

const priorityIcons = {
  0: "🔘", // No priority
  1: "🟢", // Low
  2: "🟡", // Medium
  3: "🟠", // High
  4: "🔴", // Urgent
};

const priorityLabels = {
  0: "No priority",
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Urgent",
};

const availableTags = [
  "Bug",
  "Feature Request",
  "Documentation",
  "Enhancement",
  "UI/UX"
];

const TicketCard = ({ ticket, onUpdateTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [selectedTag, setSelectedTag] = useState(ticket.tag?.[0] || availableTags[0]);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedTitle(ticket.title);
    setSelectedTag(ticket.tag?.[0] || availableTags[0]);
  };

  const handleSaveClick = () => {
    if (editedTitle.trim()) {
      onUpdateTitle(ticket.id, editedTitle, selectedTag);
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedTitle(ticket.title);
    setSelectedTag(ticket.tag?.[0] || availableTags[0]);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveClick();
    } else if (e.key === 'Escape') {
      handleCancelClick();
    }
  };

  return (
    <div
      className={`ticket-card ${isEditing ? 'is-editing' : ''}`}
      draggable={!isEditing}
      onDragStart={(e) => e.dataTransfer.setData("ticketId", ticket.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ticket-header">
        <span className="ticket-id">{ticket.id}</span>
        {isHovered && !isEditing && (
          <button 
            className="edit-button"
            onClick={handleEditClick}
            title="Edit task"
          >
            ✏
          </button>
        )}
      </div>

      <div className="ticket-content">
        <div className={`view-mode ${isEditing ? 'hidden' : ''}`}>
          <h4 className="ticket-title">{ticket.title}</h4>
        </div>

        <div className={`edit-mode ${isEditing ? 'visible' : ''}`}>
          <div className="editing-container">
            <textarea
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="title-textarea"
              autoFocus
              placeholder="Task title"
              rows={3}
            />

            {/* Tag selection dropdown */}
            <div className="tag-selection">
              <label htmlFor="tag-select">Tag:</label>
              <select 
                id="tag-select"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="tag-dropdown"
              >
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-actions">
              <button className="save-button" onClick={handleSaveClick} title="Save">
                ✓
              </button>
              <button className="cancel-button" onClick={handleCancelClick} title="Cancel">
                ✕
              </button>
              <div className="keyboard-hint">
                <small>Ctrl+Enter to save, Esc to cancel</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-footer">
        <div className="ticket-priority" title={priorityLabels[ticket.priority]}>
          {priorityIcons[ticket.priority]}
          <span className="priority-label">{priorityLabels[ticket.priority]}</span>
        </div>

        {ticket.tag && ticket.tag.length > 0 && (
          <div className="ticket-tags">
            {ticket.tag.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TicketCard.propTypes = {
  ticket: PropTypes.object.isRequired,
  onUpdateTitle: PropTypes.func.isRequired,
};

export default TicketCard;
