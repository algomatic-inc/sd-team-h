type LoadingSpinnerProps = {
  loading: boolean;
};

/** Loading spinner which overlays the entire window. */
export function LoadingSpinner({ loading }: LoadingSpinnerProps): JSX.Element {
  return loading ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  ) : (
    <></>
  );
}
