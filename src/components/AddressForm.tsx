import { FormEvent } from 'react';
import { Address } from '@/pages/mon-compte';

interface AddressFormProps {
  address?: Address | null;
  onSave: (addressData: Partial<Address>) => void;
  onCancel: () => void;
  saving: boolean;
}

const AddressForm = ({ address, onSave, onCancel, saving }: AddressFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: Partial<Address> = {
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      postal_code: formData.get('postalCode') as string,
      country: formData.get('country') as string,
    };
    if (address?.id) {
      data.id = address.id;
    }
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="street">Rue</label>
        <input type="text" id="street" name="street" defaultValue={address?.street || ''} required style={styles.input} />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="city">Ville</label>
        <input type="text" id="city" name="city" defaultValue={address?.city || ''} required style={styles.input} />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="postalCode">Code Postal</label>
        <input type="text" id="postalCode" name="postalCode" defaultValue={address?.postal_code || ''} required style={styles.input} />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="country">Pays</label>
        <input type="text" id="country" name="country" defaultValue={address?.country || ''} required style={styles.input} />
      </div>
      <div style={styles.buttonGroup}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ marginLeft: '1rem' }}>
          Annuler
        </button>
      </div>
    </form>
  );
};

const styles = {
    form: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        marginTop: '1rem',
    },
    formGroup: {
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column' as 'column',
    },
    input: {
        padding: '0.5rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    buttonGroup: {
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
    }
};

export default AddressForm;
