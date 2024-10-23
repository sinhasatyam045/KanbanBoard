/* eslint-disable react/prop-types */


import { useState } from "react";
import HighPriorityIcon from "../icons/HighPriorityIcon";
import LowPriorityIcon from "../icons/LowPriorityIcon";
import MediumPriorityIcon from "../icons/MediumPriorityIcon";
import NoPriorityIcon from "../icons/NoPriorityIcon";
import UrgentPriorityIcon from "../icons/UrgentPriorityIcon";
import "./TicketCard.styles.css";

const priorityIcons = {
  0: <NoPriorityIcon />,
  1: <LowPriorityIcon />,
  2: <MediumPriorityIcon />,
  3: <HighPriorityIcon />,
  4: <UrgentPriorityIcon />,
};

const TicketCard = ({ ticket, onUpdateTitle }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(ticket.title);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onUpdateTitle(ticket.id, editedTitle);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditedTitle(ticket.title); 
    setIsEditing(false);
  };

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("ticketId", ticket.id)}
      className="ticket-card"
    >
      <span>{ticket.id}</span>

      <div className="ticket-title">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="title-input"
          />
        ) : (
          <span>{ticket.title}</span>
        )}

        {isEditing ? (
          <>
            <button className="icon-button" onClick={handleSaveClick}>
              Y
            </button>
            <button className="icon-button" onClick={handleCancelClick}>
              N
            </button>
          </>
        ) : (
          ticket.title === "New Task" && (
            <button
              style={{ marginLeft: "10px" }}
              className="edit-button"
              onClick={handleEditClick}
            >
              Edit
            </button>
          )
        )}
      </div>

      <div className="ticket-priority-tag">
        {priorityIcons[ticket.priority]}
        {ticket.tag && <div className="ticket-tag">{ticket.tag[0]}</div>}
      </div>
    </div>
  );
};

export default TicketCard;



