export default function ErrorMessage({ message }) {
  return <div style={{ color: '#b91c1c' }}>{message || 'Something went wrong.'}</div>;
}
