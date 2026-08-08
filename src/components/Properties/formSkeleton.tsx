export  function PropertyFormDrawerSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 animate-pulse">
                {/* Name fields placeholder */}
                <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                  <div className="w-28 h-4 bg-[#EDEFF2] rounded" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="w-40 h-3 bg-[#EDEFF2] rounded" />
                      <div className="w-full h-12 bg-[#EDEFF2] rounded-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-40 h-3 bg-[#EDEFF2] rounded" />
                      <div className="w-full h-12 bg-[#EDEFF2] rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Village selector placeholder */}
                <div className="flex flex-col gap-2 border-b border-[#D4D5D8] pb-5">
                  <div className="w-16 h-3 bg-[#EDEFF2] rounded" />
                  <div className="w-full h-12 bg-[#EDEFF2] rounded-sm" />
                </div>

                {/* Listing Type placeholder */}
                <div className="flex flex-col gap-3 border-b border-[#D4D5D8] pb-5">
                  <div className="w-24 h-3 bg-[#EDEFF2] rounded" />
                  <div className="flex gap-3">
                    <div className="w-20 h-8 bg-[#EDEFF2] rounded-full" />
                    <div className="w-20 h-8 bg-[#EDEFF2] rounded-full" />
                    <div className="w-20 h-8 bg-[#EDEFF2] rounded-full" />
                  </div>
                </div>

                {/* Status placeholder */}
                <div className="flex flex-col gap-2 border-b border-[#D4D5D8] pb-5">
                  <div className="w-28 h-3 bg-[#EDEFF2] rounded" />
                  <div className="w-full h-12 bg-[#EDEFF2] rounded-sm" />
                </div>

                {/* Finishing status placeholder */}
                <div className="flex flex-col gap-3 border-b border-[#D4D5D8] pb-5">
                  <div className="w-28 h-3 bg-[#EDEFF2] rounded" />
                  <div className="flex gap-3">
                    <div className="w-24 h-8 bg-[#EDEFF2] rounded-full" />
                    <div className="w-20 h-8 bg-[#EDEFF2] rounded-full" />
                    <div className="w-24 h-8 bg-[#EDEFF2] rounded-full" />
                  </div>
                </div>
              </div>
    )
}