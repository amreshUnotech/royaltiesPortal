export const getFileNameFromHeader = (contentDisposition: string | null): string => {
    if (!contentDisposition) return 'statement.pdf';
    const match = contentDisposition.match(/filename="?(.+)"?/);
    return match?.[1] || 'statement.pdf';
  };