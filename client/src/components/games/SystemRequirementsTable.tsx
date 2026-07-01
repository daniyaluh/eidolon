import type { SystemRequirements } from "../../types/game";

interface SystemRequirementsTableProps {
  requirements: SystemRequirements;
}

export function SystemRequirementsTable({ requirements }: SystemRequirementsTableProps) {
  if (!requirements.minimum && !requirements.recommended) {
    return <p className="text-sm text-zinc-400">System requirements not available.</p>;
  }

  return (
    <table className="w-full overflow-hidden rounded-lg border border-zinc-800 text-left text-sm">
      <tbody>
        {requirements.minimum && (
          <tr className="border-b border-zinc-800">
            <th className="w-32 bg-zinc-900 px-4 py-3 font-medium text-zinc-300">Minimum</th>
            <td className="px-4 py-3 text-zinc-300 whitespace-pre-line">{requirements.minimum}</td>
          </tr>
        )}
        {requirements.recommended && (
          <tr>
            <th className="w-32 bg-zinc-900 px-4 py-3 font-medium text-zinc-300">Recommended</th>
            <td className="px-4 py-3 text-zinc-300 whitespace-pre-line">{requirements.recommended}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
