import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KanbanCard from '../components/KanbanCard';

// Mock dnd-kit hooks since we aren't testing drag-and-drop mechanics here
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('KanbanCard - Component & UI Tests', () => {
  const mockCard = {
    id: 1,
    title: 'Automated QA Testing',
    due_date: new Date('2026-05-01').toISOString(),
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderWithQuery = (ui) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('1. Render correctly displays title (Component UI Layer)', () => {
    renderWithQuery(<KanbanCard card={mockCard} onOpenModal={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Automated QA Testing')).toBeInTheDocument();
  });

  it('2. Shows due date badge correctly (Component Data Layer)', () => {
    renderWithQuery(<KanbanCard card={mockCard} onOpenModal={jest.fn()} onDelete={jest.fn()} />);
    
    // UI formats date as e.g. "1 May" or "May 1" (locale-dependent), so assert on the calendar icon.
    // Use includes to avoid encoding mismatch issues with emojis.
    expect(screen.getByText((content) => content.includes('📅'))).toBeInTheDocument();
    expect(screen.getByText(/May/i)).toBeInTheDocument();
  });

  it('3. Triggers modal open onClick (User Interaction)', () => {
    const handleOpenModal = jest.fn();
    renderWithQuery(<KanbanCard card={mockCard} onOpenModal={handleOpenModal} onDelete={jest.fn()} />);

    // Simulate user click
    const cardEl = screen.getByText('Automated QA Testing').parentElement;
    fireEvent.click(cardEl);

    expect(handleOpenModal).toHaveBeenCalledWith(mockCard);
    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  // Snapshot testing (UI Consistency check)
  it('4. Matches snapshot (Snapshot Testing UI layer)', () => {
    const { container } = renderWithQuery(
      <KanbanCard card={mockCard} onOpenModal={jest.fn()} onDelete={jest.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});
