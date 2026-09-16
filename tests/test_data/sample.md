# Operating Systems: Process Scheduling and Concurrency

## 1. Introduction to Process Management
An operating system process represents an active program in execution. The operating system kernel maintains process state information inside a Process Control Block (PCB), including program counter, CPU registers, memory limits, and open file lists.

## 2. CPU Scheduling Algorithms
The CPU scheduler decides which ready process receives CPU allocation:
- **First-Come, First-Served (FCFS)**: Non-preemptive scheduling where jobs execute in order of arrival. Can cause convoy effect.
- **Shortest Job Next (SJN)**: Selects process with smallest execution burst time.
- **Round Robin (RR)**: Preemptive scheduling where each process is allotted a fixed time quantum (e.g. 10ms to 50ms). Fair for interactive multi-user operating systems.
- **Priority Scheduling**: Processes assigned priority ratings; highest priority process runs first. Can lead to starvation, mitigated by aging.

## 3. Deadlock Conditions
A deadlock condition requires four concurrent conditions (Coffman conditions):
1. Mutual Exclusion: At least one resource held in non-shareable mode.
2. Hold and Wait: A process holds resources while requesting additional ones.
3. No Preemption: Resources cannot be forcibly taken from a process.
4. Circular Wait: A closed loop of processes where each waits for a resource held by the next.
