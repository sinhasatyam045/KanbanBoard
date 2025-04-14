import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./KanbanBoard.styles.css";
import TicketCard from "../TicketCard/TicketCard";

const priorityLevels = [
  { priorityLevel: "0", priority: "No priority", icon: "🔘" },
  { priorityLevel: "4", priority: "Urgent", icon: "🔴" },
  { priorityLevel: "3", priority: "High", icon: "🟠" },
  { priorityLevel: "2", priority: "Medium", icon: "🟡" },
  { priorityLevel: "1", priority: "Low", icon: "🟢" },
];

const fixedStatusList = [
  { status: "Backlog", icon: "📝" },
  { status: "Todo", icon: "📋" },
  { status: "In progress", icon: "⚙" },
  { status: "Done", icon: "✅" },
  { status: "Cancelled", icon: "❌" },
];

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState("status");
  const [sortBy, setSortBy] = useState("priority");
  const [isDisplayDropdownOpen, setIsDisplayDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDisplayDropdownOpen(false);
      }
    }

    if (isDisplayDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDisplayDropdownOpen]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.quicksell.co/v1/internal/frontend-assignment"
        );
        setTickets(response.data.tickets);
        setUsers(response.data.users);
        setError(null);
      } catch (error) {
        console.error("Error fetching the tickets:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const savedGroupBy = localStorage.getItem("kanbanGroupBy");
    const savedSortBy = localStorage.getItem("kanbanSortBy");

    if (savedGroupBy) setGroupBy(savedGroupBy);
    if (savedSortBy) setSortBy(savedSortBy);
  }, []);

  useEffect(() => {
    localStorage.setItem("kanbanGroupBy", groupBy);
    localStorage.setItem("kanbanSortBy", sortBy);
  }, [groupBy, sortBy]);

  const handleAddTask = (groupKey) => {
    const newTicket = {
      id: `CAM-${tickets.length + 1}`,
      title: "New Task",
      tag: ["Feature"],
      userId:
        groupBy === "user"
          ? users.find((user) => user.name === groupKey)?.id
          : null,
      status: groupBy === "status" ? groupKey : "Todo",
      priority:
        groupBy === "priority"
          ? parseInt(
              priorityLevels.find((p) => p.priority === groupKey)?.priorityLevel || "0",
              10
            )
          : 0,
    };
    setTickets([...tickets, newTicket]);
  };

  const handleUpdateTitle = (ticketId, newTitle, newTag = null) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        const updatedTicket = { ...ticket, title: newTitle };
        if (newTag) {
          updatedTicket.tag = [newTag];
        }
        return updatedTicket;
      }
      return ticket;
    });
    setTickets(updatedTickets);
  };

  const sortTickets = (ticketsArray) => {
    return [...ticketsArray].sort((a, b) => {
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
      return fixedStatusList.map((list) => ({
        groupKey: list.status,
        icon: list.icon,
        tickets: sortTickets(
          tickets.filter((ticket) => ticket.status === list.status)
        ),
      }));
    } else if (groupBy === "user") {
      const userGroups = users.map((user) => ({
        groupKey: user.name,
        icon: "👤",
        tickets: sortTickets(
          tickets.filter((ticket) => ticket.userId === user.id)
        ),
      }));

      const unassignedTickets = sortTickets(
        tickets.filter(
          (ticket) =>
            !ticket.userId || !users.some((user) => user.id === ticket.userId)
        )
      );

      return [
        ...userGroups,
        { groupKey: "Unassigned", icon: "👥", tickets: unassignedTickets },
      ];
    } else if (groupBy === "priority") {
      return priorityLevels.map((priorityItem) => ({
        groupKey: priorityItem.priority,
        icon: priorityItem.icon,
        tickets: sortTickets(
          tickets.filter(
            (ticket) =>
              ticket.priority === parseInt(priorityItem.priorityLevel, 10)
          )
        ),
      }));
    }
    return [];
  };

  const handleDrop = (e, groupKey) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("ticketId");

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        const updatedTicket = { ...ticket };

        if (groupBy === "status") {
          updatedTicket.status = groupKey;
        } else if (groupBy === "priority") {
          updatedTicket.priority = parseInt(
            priorityLevels.find((p) => p.priority === groupKey)?.priorityLevel,
            10
          );
        } else if (groupBy === "user") {
          const user = users.find((user) => user.name === groupKey);
          updatedTicket.userId = user ? user.id : null;
        }

        return updatedTicket;
      }
      return ticket;
    });

    setTickets(updatedTickets);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Loading your board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-error">
        <h3>⚠ {error}</h3>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const groupedTickets = getGroupedTickets();

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h1>Project Board</h1>
        <div className="kanban-controls">
          <div className="display-dropdown" ref={dropdownRef}>
            <button
              className="display-button"
              onClick={() => setIsDisplayDropdownOpen(!isDisplayDropdownOpen)}
            >
              <span className="display-icon">⚙</span>
              <span>Display Options</span>
              <span className="dropdown-arrow">
                {isDisplayDropdownOpen ? "▲" : "▼"}
              </span>
            </button>

            {isDisplayDropdownOpen && (
              <div className="dropdown-panel">
                <div className="dropdown-item">
                  <label htmlFor="grouping">Group by:</label>
                  <select
                    id="grouping"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <option value="status">Status</option>
                    <option value="user">User</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>

                <div className="dropdown-item">
                  <label htmlFor="ordering">Sort by:</label>
                  <select
                    id="ordering"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="kanban-board">
        {groupedTickets.map((group) => (
          <div
            key={group.groupKey}
            className="kanban-column"
            onDrop={(e) => handleDrop(e, group.groupKey)}
            onDragOver={handleDragOver}
          >
            <div className="column-header">
              <span>{group.icon}</span>
              <span>{group.groupKey}</span>
              <span className="ticket-count">({group.tickets.length})</span>
              <button onClick={() => handleAddTask(group.groupKey)}>＋</button>
            </div>
            <div className="column-tickets">
              {group.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  user={users.find((user) => user.id === ticket.userId)}
                  onUpdateTitle={handleUpdateTitle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
