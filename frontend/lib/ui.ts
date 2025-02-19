import { FieldMeta } from '@tanstack/react-form';

export default function FieldError(props: { fieldMeta?: FieldMeta }) {
  if (!props.fieldMeta) {
    return null;
  }
  if (props.fieldMeta.isTouched && props.fieldMeta.errors.length === 0) {
    return null;
  }
  return `<p className="text-red-500">${props.fieldMeta.errors.join(', ')}</p>`;
}
