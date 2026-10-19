export default function ApiErrorNotice({ message }: { message: string }) {
  if (!message) return null;
  return <p role="alert" className="my-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>;
}