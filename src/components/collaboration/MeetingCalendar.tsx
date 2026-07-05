import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { X, Plus, Calendar as CalendarIcon, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface MeetingSlot {
  id: string;
  title: string;
  start: string;
  status: 'Available' | 'Pending' | 'Confirmed';
}

const DEFAULT_SLOTS: MeetingSlot[] = [
  { id: '1', title: 'Available Slot (10:00 AM)', start: '2026-07-10T10:00:00', status: 'Available' },
  { id: '2', title: 'Investor Meet: Robert (02:00 PM)', start: '2026-07-15T14:00:00', status: 'Confirmed' }
];

export const MeetingCalendar: React.FC = () => {
  const [events, setEvents] = useState<MeetingSlot[]>(() => {
    const savedSlots = localStorage.getItem('nexus_meeting_slots');
    return savedSlots ? JSON.parse(savedSlots) : DEFAULT_SLOTS;
  });

  useEffect(() => {
    localStorage.setItem('nexus_meeting_slots', JSON.stringify(events));
  }, [events]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // Active selection tracking
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<MeetingSlot | null>(null);
  
  // Form Variables
  const [slotTitle, setSlotTitle] = useState('Available Slot');
  const [slotTime, setSlotTime] = useState('10:00');
  const [slotStatus, setSlotStatus] = useState<'Available' | 'Pending' | 'Confirmed'>('Available');

  // Date cell click (New slot creation)
  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  // Click on an existing slot block
  const handleEventClick = (info: any) => {
    const clickedSlot: MeetingSlot = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      status: info.event.extendedProps.status
    };
    setSelectedEvent(clickedSlot);
    setIsBookModalOpen(true);
  };

  // Save new slot logic
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTitle.trim()) return;

    const formattedTitle = `${slotTitle} (${convertTo12Hour(slotTime)})`;
    const fullStartDateTime = `${selectedDate}T${slotTime}:00`;

    const newSlot: MeetingSlot = {
      id: String(Date.now()),
      title: formattedTitle,
      start: fullStartDateTime,
      status: slotStatus
    };

    setEvents(prevEvents => [...prevEvents, newSlot]);
    setIsModalOpen(false);
    setSlotTitle('Available Slot');
    setSlotTime('10:00');
    setSlotStatus('Available');
  };

  // Book/Status update logic
  const handleBookSlot = (statusUpdate: 'Pending' | 'Confirmed') => {
    if (!selectedEvent) return;

    setEvents(prevEvents => 
      prevEvents.map(evt => 
        evt.id === selectedEvent.id 
          ? { ...evt, status: statusUpdate, title: evt.title.replace('Available Slot', 'Booked Session') } 
          : evt
      )
    );
    setIsBookModalOpen(false);
    setSelectedEvent(null);
  };

  // --- DELETE / BLOCK EVENT LOGIC ---
  const handleDeleteSlot = () => {
    if (!selectedEvent) return;
    
    // Filter out the selected event to delete it
    setEvents(prevEvents => prevEvents.filter(evt => evt.id !== selectedEvent.id));
    setIsBookModalOpen(false);
    setSelectedEvent(null);
  };

  const convertTo12Hour = (timeStr: string) => {
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minStr} ${ampm}`;
  };

  const eventClassNames = (arg: any) => {
    const status = arg.event.extendedProps.status;
    if (status === 'Confirmed') return '!bg-emerald-500 !text-white !border-none p-1 rounded-md shadow-sm text-xs font-medium cursor-pointer';
    if (status === 'Pending') return '!bg-amber-500 !text-white !border-none p-1 rounded-md shadow-sm text-xs font-medium cursor-pointer';
    return '!bg-blue-600 !text-white !border-none p-1 rounded-md shadow-sm text-xs font-medium cursor-pointer';
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 my-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" size={22} />
            Meeting & Availability Scheduler
          </h2>
          <p className="text-sm text-gray-500 mt-1">Click a cell to add a slot, or click an existing slot to manage/remove it</p>
        </div>
        <div className="flex gap-3 text-xs font-medium pt-2 sm:pt-0">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span> Pending</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> Confirmed</span>
        </div>
      </div>
      
      <div className="calendar-container bg-gray-50 p-4 rounded-xl border border-gray-100">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          eventClassNames={eventClassNames}
          height="68vh"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
        />
      </div>

      {/* MODAL 1: ADD NEW SLOT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Availability Slot</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Selected Date</label>
                <input type="text" value={selectedDate} disabled className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-600 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Slot Title / Type</label>
                <select value={slotTitle} onChange={(e) => setSlotTitle(e.target.value)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-800 outline-none">
                  <option value="Available Slot">Available Slot</option>
                  <option value="Investor Pitch Meeting">Investor Pitch Meeting</option>
                  <option value="Follow-up Strategy Session">Follow-up Strategy Session</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Select Time</label>
                  <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} required className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-800 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Initial Status</label>
                  <select value={slotStatus} onChange={(e) => setSlotStatus(e.target.value as any)} className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-800 outline-none">
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" leftIcon={<Plus size={16} />}>Create Slot</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE / BOOK / DELETE SLOT */}
      {isBookModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage Appointment Slot</h3>
              <button onClick={() => setIsBookModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-md">{selectedEvent.title}</h4>
                <p className="text-sm text-gray-500 mt-1">Current Status: <span className="font-semibold">{selectedEvent.status}</span></p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {selectedEvent.status === 'Available' && (
                  <Button 
                    variant="primary" 
                    className="w-full justify-center !bg-blue-600" 
                    leftIcon={<Clock size={16} />}
                    onClick={() => handleBookSlot('Pending')}
                  >
                    Request Booking (Set Pending)
                  </Button>
                )}
                
                <Button 
                  variant="success" 
                  className="w-full justify-center !bg-emerald-500 !text-white" 
                  leftIcon={<CheckCircle size={16} />}
                  onClick={() => handleBookSlot('Confirmed')}
                >
                  Confirm Meeting Slot Directly
                </Button>

                {/* --- RED DELETE BUTTON TO UNBLOCK/REMOVE SLOTS --- */}
                <button 
                  type="button"
                  className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-medium transition text-sm border border-rose-200"
                  onClick={handleDeleteSlot}
                >
                  <Trash2 size={16} />
                  Delete / Unblock This Slot
                </button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-center" 
                  onClick={() => setIsBookModalOpen(false)}
                >
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};