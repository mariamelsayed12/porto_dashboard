export default function LatestPropertiesTableSkeleton() {
  return (
    <div className="w-full flex flex-col items-start rounded-md border border-border overflow-hidden animate-pulse">
      {/* Title Header */}
      <div className="w-full bg-white px-4 py-4 border-b border-border">
        <div className="h-[23px] bg-[#EDEFF2] rounded w-36" />
      </div>

      {/* Table Shell */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse bg-white">
          <thead>
            <tr className="bg-light-primary border-b border-border text-left">
              <th className="py-3 px-4 w-[15%]">
                <div className="h-4 bg-[#EDEFF2] rounded w-20" />
              </th>
              <th className="py-3 px-4 w-[25%]">
                <div className="h-4 bg-[#EDEFF2] rounded w-28" />
              </th>
              <th className="py-3 px-4 w-[20%]">
                <div className="h-4 bg-[#EDEFF2] rounded w-24" />
              </th>
              <th className="py-3 px-4 w-[18%]">
                <div className="h-4 bg-[#EDEFF2] rounded w-20" />
              </th>
              <th className="py-3 px-4 w-[15%]">
                <div className="h-4 bg-[#EDEFF2] rounded w-24" />
              </th>
              <th className="py-3 px-4 text-right w-[7%]">
                <div className="h-4 bg-[#EDEFF2] rounded w-8 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx}>
                <td className="py-4 px-4">
                  <div className="h-4 bg-[#EDEFF2] rounded w-20" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-[#EDEFF2] rounded w-32" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-[#EDEFF2] rounded w-24" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-[#EDEFF2] rounded w-16" />
                </td>
                <td className="py-4 px-4">
                  <div className="h-8 bg-[#EDEFF2] rounded-md w-20" />
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="h-8 bg-[#EDEFF2] rounded-full w-8 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
