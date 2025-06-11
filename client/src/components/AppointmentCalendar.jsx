import React, { useState, useEffect } from 'react';
import '../css/BookingStyles.css';

const AppointmentCalendar = ({ availabilities = {}, onBook, doctorId }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Returns number of days in the given month/year
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  // Build array of Date objects (and nulls) for calendar grid
  const getDaysArray = () => {
    const numDays = daysInMonth(currentYear, currentMonth);
    const days = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    // Add blank slots for days before the 1st
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let day = 1; day <= numDays; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }
    return days;
  };

  const daysArray = getDaysArray();

  // Navigate months
  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // When a date cell is clicked
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setShowModal(true);
  };

  // Fetch available slots for the selected date
  const getSlotsForDate = (date) => {
    const key = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    return availabilities[key] || [];
  };

  // Select a time slot
  const handleTimeSelect = (time) => setSelectedTime(time);

  // Confirm booking
  const handleConfirm = async () => {
    if (onBook) {
      await onBook(doctorId, selectedDate, selectedTime);
    }
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedDate(null);
      setSelectedTime('');
    }, 3000);
  };

  return (
    <div className="booking-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-button" onClick={handlePrev}>Prev</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button className="nav-button" onClick={handleNext}>Next</button>
      </div>

      {/* Weekday Labels + Days */}
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="grid-header">{d}</div>
        ))}
        {daysArray.map((date, idx) => (
          date ? (
            <div
              key={idx}
              className={`grid-cell ${selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected-date' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              {date.getDate()}
            </div>
          ) : (
            <div key={idx} className="grid-cell empty"></div>
          )
        ))}
      </div>

      {/* Available Time Slots Panel */}
      {selectedDate && (
        <div className="slots-container">
          <h3>Available Time Slots for {selectedDate.toDateString()}</h3>
          <div className="time-slots">
            {getSlotsForDate(selectedDate).length > 0 ? (
              getSlotsForDate(selectedDate).map((time) => (
                <button
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'selected-slot' : ''}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </button>
              ))
            ) : (
              <p>No available slots.</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Appointment</h2>
            <p>{selectedDate.toDateString()} at {selectedTime}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-confirm"
                onClick={handleConfirm}
                disabled={!selectedTime}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-message">
            <h2>Booked!</h2>
            <p>Your appointment has been confirmed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;