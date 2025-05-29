// client/src/pages/Ordonnances.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchOrdonnances, createOrdonnance, updateOrdonnance, deleteOrdonnance, downloadOrdonnancePdf } from '../api/ordonnances';
import { fetchConsultations } from '../api/consultations';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import * as Yup from 'yup';

// Validation schema
const schema = Yup.object().shape({
  consultationId: Yup.number().required('Consultation is required'),
  prescription: Yup.string().required('Prescription text is required')
});

export default function OrdonnancesPage() {
  const [ords, setOrds] = useState([]);
  const [consults, setConsults] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [form, setForm] = useState({ id: null, consultationId: null, prescription: '' });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const toast = useRef(null);

  // Load ordonnances + consultations for dropdown
  useEffect(() => {
    load();
    fetchConsultations().then(data =>
      setConsults(data.map(c => ({
        label: `${c.Patient.firstName} ${c.Patient.lastName} @ ${new Date(c.dateTime).toLocaleDateString()}`,
        value: c.id
      })))
    );
  }, []);

  const load = async () => {
    try {
      const data = await fetchOrdonnances();
      setOrds(data);
    } catch {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Load failed', life: 3000 });
    }
  };

  const openNew = () => {
    setForm({ id: null, consultationId: null, prescription: '' });
    setErrors({});
    setEditing(false);
    setDialogVisible(true);
  };

  const openEdit = o => {
    setForm({ id: o.id, consultationId: o.consultationId, prescription: o.prescription });
    setErrors({});
    setEditing(true);
    setDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);

  const handleSubmit = async () => {
    try {
      await schema.validate(form, { abortEarly: false });
      const payload = {
        consultationId: form.consultationId,
        prescription: form.prescription
      };
      if (editing) {
        await updateOrdonnance(form.id, payload);
        toast.current.show({ severity: 'success', summary: 'Updated', life: 3000 });
      } else {
        await createOrdonnance(payload);
        toast.current.show({ severity: 'success', summary: 'Created', life: 3000 });
      }
      hideDialog();
      load();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const fieldErr = {};
        err.inner.forEach(({ path, message }) => { fieldErr[path] = message; });
        setErrors(fieldErr);
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
      }
    }
  };

  const confirmDelete = async o => {
    if (window.confirm('Delete this ordonnance?')) {
      try {
        await deleteOrdonnance(o.id);
        toast.current.show({ severity: 'success', summary: 'Deleted', life: 3000 });
        load();
      } catch {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 });
      }
    }
  };

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button label="New Ordonnance" icon="pi pi-plus" onClick={openNew} />
    </div>
  );

  return (
    <div className="p-m-4">
      <Toast ref={toast} />
      <DataTable value={ords} header={header} paginator rows={10} responsiveLayout="scroll">
        <Column field="id" header="ID" style={{ width: '4rem' }} />
        <Column
          header="Consultation"
          body={row => row.consultationId}
        />
        <Column field="prescription" header="Prescription" />
        <Column
          header="PDF"
          body={row => (
            <Button
              icon="pi pi-download"
              className="p-button-text"
              onClick={async () => {
                try {
                  const blob = await downloadOrdonnancePdf(row.id);
                  const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ordonnance_${row.id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          )}
        />
        <Column
          header="Actions"
          body={row => (
            <>
              <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-mr-2" onClick={() => openEdit(row)} />
              <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => confirmDelete(row)} />
            </>
          )}
        />
      </DataTable>

      <Dialog visible={dialogVisible} style={{ width: '450px' }} header={editing ? 'Edit Ordonnance' : 'New Ordonnance'} modal onHide={hideDialog}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="consultation">Consultation</label>
            <Dropdown
              id="consultation"
              value={form.consultationId}
              options={consults}
              onChange={e => setForm({ ...form, consultationId: e.value })}
              placeholder="Select Consultation"
            />
            {errors.consultationId && <small className="p-error">{errors.consultationId}</small>}
          </div>
          <div className="p-field">
            <label htmlFor="prescription">Prescription</label>
            <InputTextarea
              id="prescription"
              value={form.prescription}
              onChange={e => setForm({ ...form, prescription: e.target.value })}
              rows={4}
            />
            {errors.prescription && <small className="p-error">{errors.prescription}</small>}
          </div>
        </div>
        <div className="p-dialog-footer">
          <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>
    </div>
  );
}
