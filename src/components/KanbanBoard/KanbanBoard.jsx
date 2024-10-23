import { useState, useEffect } from "react";
import axios from "axios";
import "./KanbanBoard.styles.css";
import TicketCard from "../TicketCard/TicketCard";
import DisplayIcon from "../icons/DisplayIcon";
import DownIcon from "../icons/DownIcon";
import AddIcon from "../icons/AddIcon";
import ThreeDotsIcon from "../icons/ThreeDotsIcon";
import BacklogIcon from "../icons/BacklogIcon";
import TodoIcon from "../icons/TodoIcon";
import InProgressIcon from "../icons/InProgressIcon";
import DoneIcon from "../icons/DoneIcon";
import CancelledIcon from "../icons/CancelledIcon";
import NoPriorityIcon from "../icons/NoPriorityIcon";
import LowPriorityIcon from "../icons/LowPriorityIcon";
import MediumPriorityIcon from "../icons/MediumPriorityIcon";
import HighPriorityIcon from "../icons/HighPriorityIcon";
import UrgentColorIcon from "../icons/UrgentColorIcon";

const priorityLevels = [
  { priorityLevel: "0", priority: "No priority", icon: <NoPriorityIcon /> },
  { priorityLevel: "4", priority: "Urgent", icon: <UrgentColorIcon /> },
  { priorityLevel: "2", priority: "Medium", icon: <MediumPriorityIcon /> },
  { priorityLevel: "3", priority: "High", icon: <HighPriorityIcon /> },
  { priorityLevel: "1", priority: "Low", icon: <LowPriorityIcon /> },
  
];
const fixedStatusList = [
  { status: "Backlog", icon: <BacklogIcon /> },
  { status: "Todo", icon: <TodoIcon /> },
  { status: "In progress", icon: <InProgressIcon /> },
  { status: "Done", icon: <DoneIcon /> },
  { status: "Cancelled", icon: <CancelledIcon /> },
];

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState("status"); 
  const [sortBy, setSortBy] = useState("priority"); 
  const [isDisplayDropdownOpen, setIsDisplayDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.quicksell.co/v1/internal/frontend-assignment"
        );
        const fetchedTickets = response.data.tickets;
        const fetchedUsers = response.data.users;
        setTickets(fetchedTickets);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching the tickets:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddTask = (groupKey) => {
    const newTicket = {
      id: `CAM-${tickets.length + 1}`,
      title: "New Task",
      tag: ["General"],
      userId: null, 
      status: groupBy === "status" ? groupKey : "Todo", // Default to Todo if not grouping by status
      priority: 0, // No priority initially
    };
    setTickets([...tickets, newTicket]);
  };

  const sortTickets = (ticketsArray) => {
    return ticketsArray.sort((a, b) => {
      if (sortBy === "priority") {
        return b.priority - a.priority;
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  const getGroupedTickets = () => {
    if (groupBy === "status") {
      // Group by status
      return fixedStatusList.map((list) => ({
        groupKey: list.status,
        icon: list.icon,
        tickets: sortTickets(
          tickets.filter((ticket) => ticket.status === list.status)
        ),
      }));
    } else if (groupBy === "user") {
      // Group by user
      return users.map((user) => ({
        groupKey: user.name,
        icon: null,
        tickets: sortTickets(
          tickets.filter((ticket) => ticket.userId === user.id)
        ),
      }));
    } else if (groupBy === "priority") {
      // Group by priority
      return priorityLevels.map((priority, index) => ({
        groupKey: priority.priority,
        icon: priority.icon,
        tickets: sortTickets(
          tickets.filter((ticket) => ticket.priority === index)
        ),
      }));
    }
    return [];
  };

  const handleDrop = (e, groupKey) => {
    const ticketId = e.dataTransfer.getData("ticketId");
    const ticket = tickets.find((ticket) => ticket.id === ticketId);
    ticket.status = groupKey;
    setTickets([...tickets]);
  };

  const renderColumns = () => {
    const groupedTickets = getGroupedTickets();

    return groupedTickets.map(({ groupKey, tickets, icon }) => {
      console.log(groupKey, tickets);

      return (
        <div
          onDrop={(e) => handleDrop(e, groupKey)}
          onDragOver={(e) => e.preventDefault()}
          className="kanban-column"
          key={groupKey}
        >
          <div className="column-header">
            <div className="column-header-title">
              <div className="column-header-icon">{icon}</div>
              <h3>{groupKey}</h3>
              <div className="column-header-count">{tickets.length}</div>
            </div>

            <div className="column-header-buttons">
              <button
                className="add-ticket-button"
                onClick={() => handleAddTask(groupKey)}
              >
                <AddIcon />
              </button>
              <div>
                <ThreeDotsIcon />
              </div>
            </div>
          </div>

          <div className="ticket-list">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <p>No tickets</p> 
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="kanban-board">
      <div className="kanban-controls">
        <div
          className="dropdown"
          onClick={() => setIsDisplayDropdownOpen(!isDisplayDropdownOpen)}
        >
          <label className="display-button">
            <span>
              <DisplayIcon />
            </span>
            <span>Display</span>
            <span>
              <DownIcon />
            </span>
          </label>
          {isDisplayDropdownOpen && (
            <div
              className="dropdown-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dropdown-item">
                <label>Grouping</label>
                <select
                  value={groupBy}
                  className="dropdown-item-select"
                  onChange={(e) => setGroupBy(e.target.value)}
                  onClick={(e) => e.stopPropagation()} 
                >
                  <option value="status">Status</option>
                  <option value="user">User</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              <div className="dropdown-item">
                <label>Ordering</label>
                <select
                  value={sortBy}
                  className="dropdown-item-select"
                  onChange={(e) => setSortBy(e.target.value)}
                  onClick={(e) => e.stopPropagation()} 
                >
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="kanban-columns">{renderColumns()}</div>
    </div>
  );
};

export default KanbanBoard;




