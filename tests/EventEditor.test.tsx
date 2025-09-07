import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import EventEditor from '../packages/web/app/components/EventEditor';

const mockCreateTripEvent = vi.fn();
const mockUpdateTripEvent = vi.fn();

vi.mock('convex/react', () => ({
  useMutation: (mutation: any) => {
    if (mutation.toString().includes('createTripEvent')) {
      return mockCreateTripEvent;
    }
    if (mutation.toString().includes('updateTripEvent')) {
      return mockUpdateTripEvent;
    }
    return vi.fn();
  },
}));

vi.mock('../packages/backend/convex/_generated/api', () => ({
  api: {
    tripEvents: {
      createTripEvent: 'createTripEvent',
      updateTripEvent: 'updateTripEvent',
    },
  },
}));

test('renders EventEditor and handles form submission for new event', async () => {
  const onClose = vi.fn();
  const tripId = 'trip123' as any;

  mockCreateTripEvent.mockResolvedValue('event123');

  render(<EventEditor tripId={tripId} onClose={onClose} />);

  expect(screen.getByText('New Event')).toBeInTheDocument();

  const titleInput = screen.getByLabelText(/Title/);
  const notesTextarea = screen.getByLabelText(/Notes/);
  const kindSelect = screen.getByLabelText(/Kind/);
  const saveButton = screen.getByText('Save Event');

  fireEvent.change(titleInput, { target: { value: 'Test Event' } });
  fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });
  fireEvent.change(kindSelect, { target: { value: 'unscheduled' } });

  expect(titleInput).toHaveValue('Test Event');
  expect(notesTextarea).toHaveValue('Test notes');
  expect(kindSelect).toHaveValue('unscheduled');

  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(mockCreateTripEvent).toHaveBeenCalledWith({
      tripId,
      title: 'Test Event',
      notes: 'Test notes',
      kind: 'unscheduled',
    });
  });

  await waitFor(() => {
    expect(onClose).toHaveBeenCalled();
  });
});

test('renders EventEditor for editing existing event', async () => {
  const onClose = vi.fn();
  const tripId = 'trip123' as any;
  const existingEvent = {
    _id: 'event123' as any,
    title: 'Existing Event',
    notes: 'Existing notes',
    kind: 'allDay' as const,
    startDate: '2024-06-15',
    endDate: '2024-06-16',
  };

  mockUpdateTripEvent.mockResolvedValue(true);

  render(
    <EventEditor 
      tripId={tripId} 
      onClose={onClose} 
      event={existingEvent}
    />
  );

  expect(screen.getByText('Edit Event')).toBeInTheDocument();

  const titleInput = screen.getByLabelText(/Title/);
  const notesTextarea = screen.getByLabelText(/Notes/);

  expect(titleInput).toHaveValue('Existing Event');
  expect(notesTextarea).toHaveValue('Existing notes');

  fireEvent.change(titleInput, { target: { value: 'Updated Event' } });

  const saveButton = screen.getByText('Save Event');
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(mockUpdateTripEvent).toHaveBeenCalledWith({
      eventId: existingEvent._id,
      tripId,
      title: 'Updated Event',
      notes: 'Existing notes',
      kind: 'allDay',
      startDate: '2024-06-15',
      endDate: '2024-06-16',
    });
  });
});

test('handles clear dates functionality for all-day events', () => {
  const onClose = vi.fn();
  const tripId = 'trip123' as any;
  const eventWithDates = {
    _id: 'event123' as any,
    title: 'Event with dates',
    kind: 'allDay' as const,
    startDate: '2024-06-15',
    endDate: '2024-06-16',
  };

  render(
    <EventEditor 
      tripId={tripId} 
      onClose={onClose} 
      event={eventWithDates}
    />
  );

  // The event kind should be pre-selected as allDay, which shows the date fields
  const clearButton = screen.getByText('Clear dates');
  const startInput = screen.getByLabelText(/Start Date/);
  const endInput = screen.getByLabelText(/End Date/);

  expect(startInput).toHaveValue('2024-06-15');
  expect(endInput).toHaveValue('2024-06-16');

  fireEvent.click(clearButton);

  expect(startInput).toHaveValue('');
  expect(endInput).toHaveValue('');
});

test('validates required title field', async () => {
  const onClose = vi.fn();
  const tripId = 'trip123' as any;

  render(<EventEditor tripId={tripId} onClose={onClose} />);

  const saveButton = screen.getByText('Save Event');
  
  expect(saveButton).toBeDisabled();

  const titleInput = screen.getByLabelText(/Title/);
  fireEvent.change(titleInput, { target: { value: '   ' } });
  
  expect(saveButton).toBeDisabled();

  fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
  
  expect(saveButton).not.toBeDisabled();
});