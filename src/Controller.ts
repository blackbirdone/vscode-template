/**
 *  @param {import(".").NS } ns
 *  @returns {Promise}
 * 
 *  */
export async function main(ns) : Promise{

	BitBurner.getInstance(ns);

	ScheduleService.getInstance().addHandler(new WeakJobHandler(ns));

	
	await ScheduleService.getInstance().start(ns);

z
}

class CommandQueue {

	_commands = [];

	queue(command) {
		this._commands.push(command);
	}

	enqueue() {
		const command = this._commands.shift();
		if (command != null) {
			return command;
		}
		return null;
	}


	static getInstance() {
		return new JobQueue();
	}


}


export class ScheduleService {

	_isRunning = false;

	_jobQueue = [];

	_commandqueue = [];

	_handlers = [];

	_workers = new Map();


	async start(ns) {
		this._isRunning = true;
		await this._mainLoop(ns);
	}

	stop() {
		this._isRunning = false;
	}

	_init() {
        //
	}

	async _mainLoop(ns) {

		const loopTime = 2;

		const jobService = JobService.getInstance();

		// let ns = BitBurner.getInstance().functions();

		const serverInfos = new ServerInfos();

		const serverList = serverInfos.getServerList(ns);

		let workerUpdateTime = performance.now();
		while (this._isRunning) {
			const startTime = performance.now();

			// commands can handle behaivior
			for (let command; command = this._commandqueue.shift();) {
                //
			}

			// server zum system adden




			// gucken ob es einen neuen Job gibt


			// jobs abarbeiten until null

			for (let job; job = this._jobQueue.shift();) {

				const fullfilled = await this._handleJob(job);
				if (!fullfilled) {
					this._jobQueue.unshift(job);
					break;
				}
			}

			if ((15 * 1000 < (performance.now() - workerUpdateTime))) {
				for (const serverIndex in serverList) {
					const server = serverList[serverIndex];


					// remove not availables anymore

					// if new
					if (!this._workers.has(server.name)) {
						const worker = new Worker(ns);
						worker._id = "1";
						worker._hostName = server.name;
						worker._ram = server.ram;
						if (worker._ram > 0) {
							worker._isBusy = true;
						}
						worker._isBusy = false;


						this._workers.set(server.name, worker);
					}
					//if not new



				}
				workerUpdateTime = performance.now();
			}



			// update worker stats






			// weak braucht  17 threads


			// server mit 3 und 4 gb gb ram
			// 3 gb = 1
			// 4 gb = 2
			// 3 threads pro run


			// job weaken 17

			//let job = new Job("weak", 17, { target: "n00dles" });












			const sleepTime = (loopTime * 1000) - (performance.now() - startTime);

			if (sleepTime > 0) {
				await ns.sleep(sleepTime);
			} else {
				await ns.sleep(1000);
			}
		}
		return true;
	}

	async _handleJob(job) {
		for (const index in this._handlers) {
			const handler = this._handlers[index];
			if (handler.isUsable(job)) {
				return await handler.handle(job, this._workers);
			}
		}
		// erro if kei nhandler für job oder log oder so was tun dann

		return true;
	}

	queueJob(job) {
		this._jobQueue.push(job);
	}

	queueWorker(worker) {

	}

	queueCommand(command) {
		this._commandqueue.puh(command);
	}

	addHandler(handler) {
		this._handlers.push(handler);
	}


	/**
	 * 
	 * @returns {ScheduleService}
	 */
	static getInstance() {
		return ScheduleService._instance;
	}

	static getInstance(ns) {

		if (ScheduleService._instance) {
			return ScheduleService._instance;
		}
		ScheduleService._instance = new ScheduleService(ns);
		return ScheduleService._instance;
	}
}



class WeakJobHandler {

	file = "weakenJob.js";
	ram = -99;
	_ns;

	constructor(ns) {
		this.ram = ns.getScriptRam(this.file);
		this._ns = ns;
	}


	isUsable(job) {
		if (job instanceof Job && job.getJobName() === "weakServer") {
			return true;
		}
		return false;
	}

	/**
	 * 
	 * @param {Job} job 
	 */
	async handle(job, workers) {

		for (const [name, worker] of workers) {
			if (!worker.canHandle("weakServerJob")) {
				await this.prepareWorker(worker);
			}

			job._scriptName = this.file;
			job._scriptRam = this.ram;

			const fullfilled = worker.handleJob(job);
			if (fullfilled) {
				break;
			}
		}
		return job.getThreadsAvailable() <= 0;
	}

	/**
	 * 
	 * @param {Worker} worker 
	 */
	async prepareWorker(worker) {
		await (async () => await this._ns.scp(this.file, "home", worker.getHostName()))();
	}
}


class JobService {

	_worker = [];
	_jobList = [];

	_currentJob;

	/**
	 * 
	 * @param {Job} job 
	 */
	handleJob(job) {
		this._jobList.push(job);



	}

	createTask(job) {

	}


	static getInstance() {
		if (JobService._instance) {
			return JobService._instance;
		}
		JobService._instance = new JobService();
		return JobService._instance;
	}
}

class BitBurner {

	_ns;

	constructor(ns) {
		this._ns = ns;
	}

	/**
	 * 
	 * @param {*} ns 
	 * @returns {BitBurner}
	 */
	static getInstance(ns) {
		if (BitBurner._instance) {
			return BitBurner._instance;
		}
		BitBurner._instance = new BitBurner(ns);
		return BitBurner._instance;
	}

	/**
	 * @returns {import(".").NS }
	 */
	functions() {
		return this._ns;
	}
}

export class Job {

	_id;

	_taskList = [];


	_jobName;
	_threadsNeeded;
	_threadsDone = 0;

	_job;

	_args;

	_scriptName;
	_scriptRam;

	constructor(jobName, threads, args) {
		this._threadsNeeded = threads;
		this._jobName = jobName;
		this._args = args;
	}

	/**
	 * 
	 * @returns {string}
	 */
	getJobName() {
		return this._jobName;
	}

	getScriptRam() {
		return this._scriptRam;
	}

	getScriptName() {
		return this._scriptName;
	}

	getArgument(key) {
		return this._args[key];
	}

	threadsInProgress(threads) {
		this._threadsDone += threads;
	}

	getThreadsAvailable() {
		return this._threadsNeeded - this._threadsDone;
	}
}


class Worker {

	_id;
	_hostName;
	_ram;
	_isBusy;

	_handlerFeatures = [];
	_ns;

	constructor(ns) {
		this._ns = ns;
	}
	/**
	 * 
	 * @param {Job} job 
	 * @returns 
	 */
	handleJob(job) {
		if (this._isBusy) {
			return false;
		}
		const ns = this._ns;



		const ramAvailable = this._ram - ns.getServerUsedRam(this._hostName);

		if (ramAvailable <= 0) {
			return false;
		}

		let threads = ramAvailable / job.getScriptRam();
		threads = Math.floor(threads);

		if (threads <= 0) {
			return false;
		}

		if (job.getThreadsAvailable() < threads) {
			threads = job.getThreadsAvailable();
		}

		
		const pid = ns.exec(job.getScriptName(), this._hostName, threads, job.getArgument("target"));
		job.threadsInProgress(threads);
		
		ns.tprint("Worker handleJob " + this._hostName + " for  " + threads + " Threads" + " left " + job.getThreadsAvailable());

		if (job.getThreadsAvailable() <= 0) {
			return true;
		}

		return false;
	}

	canHandle(process) {
		return this._handlerFeatures.includes(process);
	}

	getHostName() {
		return this._hostName;
	}
}


class ServerInfos {

	constructor() {

	}

	/** @param {NS} ns **/
	getServerList(ns) {

		const workList = ["home"];
		const serverList = [];

		this._buildBotNetMap(ns, "home", workList, serverList);

		return serverList;
	}

	/** @param {NS} ns **/
	getOwnServerList(ns) {

		return this._buildOwnServerList(ns);

	}

	/** @param {NS} ns **/
	_buildOwnServerList(ns) {

		const serverInfoList = [];
		const scanList = ns.getPurchasedServers();

		for (const index in scanList) {
			const hostName = scanList[index];

			const serverInfo = new ServerInfo();
			serverInfo.name = hostName;
			serverInfo.hackTime = Math.floor(ns.getHackTime(hostName));
			serverInfo.weakenTime = Math.floor(ns.getWeakenTime(hostName));
			serverInfo.growTime = Math.floor(ns.getGrowTime(hostName));
			serverInfo.maxMoney = Math.floor(ns.getServerMaxMoney(hostName));
			serverInfo.currentMoney = Math.floor(ns.getServerMoneyAvailable(hostName));
			serverInfo.securityLevel = Math.floor(ns.getServerSecurityLevel(hostName));
			serverInfo.minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(hostName));
			serverInfo.ram = ns.getServerMaxRam(hostName);

			serverInfoList.push(serverInfo);

		}

		return serverInfoList;
	}

	_buildBotNetMap(ns, target, serverDone, serverInfoList) {

		const scanList = ns.scan(target);

		for (const index in scanList) {
			const hostName = scanList[index];

			if (serverDone.includes(hostName)) {
				continue;
			}

			if (parseInt(ns.getHackingLevel()) <= parseInt(ns.getServerRequiredHackingLevel(hostName))) {
				continue;
			}
			serverDone.push(hostName);

			// hackTime;		weakenTime;	growTime;	maxMoney;	currentMoney;	securityLevel;	minSecurityLevel;

			const serverInfo = new ServerInfo();
			serverInfo.name = hostName;
			serverInfo.hackTime = Math.floor(ns.getHackTime(hostName));
			serverInfo.weakenTime = Math.floor(ns.getWeakenTime(hostName));
			serverInfo.growTime = Math.floor(ns.getGrowTime(hostName));
			serverInfo.maxMoney = Math.floor(ns.getServerMaxMoney(hostName));
			serverInfo.currentMoney = Math.floor(ns.getServerMoneyAvailable(hostName));
			serverInfo.securityLevel = Math.floor(ns.getServerSecurityLevel(hostName));
			serverInfo.minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(hostName));
			serverInfo.ram = ns.getServerMaxRam(hostName);
            

			serverInfoList.push(serverInfo);

			this._buildBotNetMap(ns, hostName, serverDone, serverInfoList);
		}
	}

}

class ServerInfo {
	name;
	hackTime;
	weakenTime;
	growTime;
	maxMoney;
	currentMoney;
	securityLevel;
	minSecurityLevel;
	ram;
}