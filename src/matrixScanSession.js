
function MatrixScanSession(newlyTrackedCodes) {
	this.newlyTrackedCodes = newlyTrackedCodes;
	this.rejectedTrackedCodes = [];
	this.trackedCodeStates = {};
}

MatrixScanSession.prototype.rejectTrackedCode = function(code) {
	this.rejectedTrackedCodes.push(code.uniqueId);
}

MatrixScanSession.prototype.setStateForTrackedCode = function(code, stateObject) {
	this.trackedCodeStates[code.uniqueId] = stateObject;
}

module.exports = MatrixScanSession;
