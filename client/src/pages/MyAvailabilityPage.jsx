import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import useAuth from '../auth/useAuth';
import api from '../api/axios';

// Days of week options
const days = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 }
];

export default function MyAvailabilityPage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({ dayOfWeek: null, startTime: null, endTime: null });
  const [editing, setEditing] = useState(false);
  const toast = useRef(null);

  // Load availabilities
  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/availabilities/me');
      setSlots(res.data);
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Could not load slots', life: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm({ dayOfWeek: null, startTime: null, endTime: null });
    setEditing(false);
    setDialogVisible(true);
  };

  const openEdit = slot => {
    setForm({
      ...slot,
      startTime: new Date(`1970-01-01T${slot.startTime}`),
      endTime: new Date(`1970-01-01T${slot.endTime}`)
    });
    setEditing(true);
    setDialogVisible(true);
  };

  const saveSlot = async () => {
    const payload = {
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime.toTimeString().substr(0,5),
      endTime: form.endTime.toTimeString().substr(0,5)
    };
    try {
      if (editing) {
        await api.put(`/availabilities/${form.id}`, payload);
        toast.current.show({ severity: 'success', summary: 'Updated', life: 3000 });
      } else {
        await api.post('/availabilities', payload);
        toast.current.show({ severity: 'success', summary: 'Created', life: 3000 });
      }
      setDialogVisible(false);
      load();
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Save failed', life: 3000 });
    }
  };

  const deleteSlot = async slot => {
    if (window.confirm('Delete this slot?')) {
      try {
        await api.delete(`/availabilities/${slot.id}`);
        toast.current.show({ severity: 'success', summary: 'Deleted', life: 3000 });
        load();
      } catch {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 });
      }
    }
  };

  const dialogFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} />
      <Button label="Save" icon="pi pi-check" onClick={saveSlot} />
    </div>
  );

  return (
    <div className="p-m-4">
      <Toast ref={toast} />
      <div className="p-d-flex p-jc-between p-ai-center p-mb-3">
        <h2>My Availability</h2>
        <Button label="New Slot" icon="pi pi-plus" onClick={openNew} />
      </div>
      <DataTable value={slots} loading={loading} responsiveLayout="scroll">
        <Column field="dayOfWeek" header="Day" body={row => days.find(d => d.value === row.dayOfWeek)?.label} />
        <Column field="startTime" header="Start" />
        <Column field="endTime" header="End" />
        <Column
          header="Actions"
          body={row => (
            <>
              <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => openEdit(row)} />
              <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => deleteSlot(row)} />
            </>
          )}
        />
      </DataTable>

      <Dialog header={editing ? 'Edit Slot' : 'New Slot'} visible={dialogVisible} modal onHide={() => setDialogVisible(false)} footer={dialogFooter}>
        <div className="p-fluid">
          <div className="p-field">
            <label>Day of Week</label>
            <Dropdown
              options={days}
              optionLabel="label"
              optionValue="value"
              value={form.dayOfWeek}
              onChange={e => setForm({ ...form, dayOfWeek: e.value })}
              placeholder="Select day"
            />
          </div>
          <div className="p-field">
            <label>Start Time</label>
            <Calendar
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.value })}
              timeOnly
              hourFormat="24"
            />
          </div>
          <div className="p-field">
            <label>End Time</label>
            <Calendar
              value={form.endTime}
              onChange={e => setForm({ ...form, endTime: e.value })}
              timeOnly
              hourFormat="24"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
