-- Update canvas operations to support Excalidraw operation types
-- Remove old constraint
ALTER TABLE canvas_operations DROP CONSTRAINT IF EXISTS canvas_operations_operation_type_check;

-- Add new constraint with additional operation types
ALTER TABLE canvas_operations ADD CONSTRAINT canvas_operations_operation_type_check 
CHECK (operation_type IN ('text', 'draw', 'erase', 'clear', 'move', 'delete', 'excalidraw_update', 'text_update'));