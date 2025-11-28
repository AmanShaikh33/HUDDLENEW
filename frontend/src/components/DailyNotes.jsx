import React, { useState, useEffect } from "react";
import { createNote, getActiveNotes, getMyProfile, deleteNote } from "../../api/api";
import { MoreHorizontal } from "lucide-react";

const DailyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMyProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await getActiveNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    const interval = setInterval(fetchNotes, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;
    try {
      setLoading(true);
      await createNote(newNote.trim());
      setNewNote("");
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setLoading(true);
      await deleteNote(noteId);
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setShowMenuId(null);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl p-3 w-full md:w-72 shadow-sm border border-gray-200 h-full">

      {/* HEADER */}
      <h3 className="text-base md:text-lg font-semibold mb-3 text-purple-600">
        Daily Thoughts
      </h3>

      {/* INPUT SECTION */}
      <div className="flex mb-3 md:mb-4 gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Share a thought..."
          className="flex-1 text-sm border border-gray-300 rounded-full px-3 py-2 
                     focus:outline-none focus:ring-1 focus:ring-purple-400"
        />

        <button
          onClick={handleCreateNote}
          className="bg-purple-600 text-white px-4 py-2 rounded-full 
                     text-xs md:text-sm hover:bg-purple-700 transition"
        >
          Post
        </button>
      </div>

      {/* ONLY THIS PART SCROLLS */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-500 text-sm">No thoughts yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="flex items-start justify-between gap-2 p-2 bg-purple-50 rounded-lg"
            >
              <div className="flex items-start gap-2">
                {note.user?.profilePic?.url ? (
                  <img
                    src={note.user.profilePic.url}
                    alt={note.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center text-white text-sm font-semibold">
                    {note.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    {note.user?.name}
                  </p>

                  <p className="text-sm text-gray-800 leading-tight">{note.content}</p>

                  <p className="text-xs text-gray-400">
                    {new Date(note.expiresAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    left
                  </p>
                </div>
              </div>

              {note.user?._id === user?._id && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowMenuId(showMenuId === note._id ? null : note._id)
                    }
                    className="p-1 rounded hover:bg-purple-200"
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {showMenuId === note._id && (
                    <div className="absolute right-0 top-full mt-1 w-24 bg-white border rounded shadow-md z-10">
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-purple-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DailyNotes;
