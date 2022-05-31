import DeactivateRepo from "./DeactivateRepo";
import EraseRepoContent from "./EraseRepoContent";

function DanerZone() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-lg font-semibold">Danger Zone</h1>
                <p>
                    Erase repo coverage data and pause upload ability
                </p>
                <hr />
            </div>
            <div className="flex flex-col border-2 border-gray-100 p-4 xl:w-4/5 2xl:w-3/5 gap-7">
                <EraseRepoContent />
                <DeactivateRepo />
            </div>
        </div>
    )
}

export default DanerZone;