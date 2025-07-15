// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VillageSACCO is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

    // Events
    event MemberRegistered(address indexed member, string memberId);
    event SavingsDeposited(address indexed member, uint256 amount, uint256 newBalance);
    event SavingsWithdrawn(address indexed member, uint256 amount, uint256 newBalance);
    event LoanRequested(address indexed borrower, uint256 amount, string purpose);
    event LoanApproved(address indexed borrower, uint256 amount, uint256 loanId);
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 loanId);
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support);
    event InterestDistributed(uint256 totalAmount, uint256 timestamp);

    // Structs
    struct Member {
        string memberId;
        uint256 savingsBalance;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 joinedAt;
        bool isActive;
    }

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 termMonths;
        uint256 monthlyPayment;
        uint256 remainingBalance;
        uint256 disbursedAt;
        uint256 nextPaymentDue;
        string purpose;
        bool isActive;
    }

    struct Proposal {
        string title;
        string description;
        address creator;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 totalVotes;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // State variables
    mapping(address => Member) public members;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Proposal) public proposals;
    
    address[] public memberList;
    uint256 public totalSavings;
    uint256 public totalLoansIssued;
    uint256 public nextLoanId;
    uint256 public nextProposalId;
    uint256 public interestRate = 500; // 5% annual interest (in basis points)
    uint256 public loanInterestRate = 1500; // 15% annual interest (in basis points)
    
    // Minimum savings required to request a loan
    uint256 public minimumSavingsForLoan = 100 ether;
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not an admin");
        _;
    }
    
    modifier onlyMember() {
        require(hasRole(MEMBER_ROLE, msg.sender), "Not a member");
        _;
    }
    
    modifier onlyActiveMember() {
        require(hasRole(MEMBER_ROLE, msg.sender) && members[msg.sender].isActive, "Not an active member");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        nextLoanId = 1;
        nextProposalId = 1;
    }

    // Admin functions
    function addAdmin(address admin) external onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) external onlyAdmin {
        require(admin != msg.sender, "Cannot remove yourself");
        revokeRole(ADMIN_ROLE, admin);
    }

    function registerMember(address memberAddress, string memory memberId) external onlyAdmin {
        require(!hasRole(MEMBER_ROLE, memberAddress), "Already a member");
        
        grantRole(MEMBER_ROLE, memberAddress);
        members[memberAddress] = Member({
            memberId: memberId,
            savingsBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            joinedAt: block.timestamp,
            isActive: true
        });
        
        memberList.push(memberAddress);
        emit MemberRegistered(memberAddress, memberId);
    }

    function deactivateMember(address memberAddress) external onlyAdmin {
        require(hasRole(MEMBER_ROLE, memberAddress), "Not a member");
        members[memberAddress].isActive = false;
    }

    function activateMember(address memberAddress) external onlyAdmin {
        require(hasRole(MEMBER_ROLE, memberAddress), "Not a member");
        members[memberAddress].isActive = true;
    }

    // Savings functions
    function deposit() external payable onlyActiveMember nonReentrant {
        require(msg.value > 0, "Deposit must be greater than 0");
        
        Member storage member = members[msg.sender];
        member.savingsBalance += msg.value;
        member.totalDeposits += msg.value;
        totalSavings += msg.value;
        
        emit SavingsDeposited(msg.sender, msg.value, member.savingsBalance);
    }

    function withdraw(uint256 amount) external onlyActiveMember nonReentrant {
        Member storage member = members[msg.sender];
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(member.savingsBalance >= amount, "Insufficient savings balance");
        
        member.savingsBalance -= amount;
        member.totalWithdrawals += amount;
        totalSavings -= amount;
        
        payable(msg.sender).transfer(amount);
        emit SavingsWithdrawn(msg.sender, amount, member.savingsBalance);
    }

    // Loan functions
    function requestLoan(
        uint256 amount,
        uint256 termMonths,
        string memory purpose
    ) external onlyActiveMember returns (uint256) {
        require(amount > 0, "Loan amount must be greater than 0");
        require(termMonths > 0 && termMonths <= 60, "Invalid loan term");
        require(members[msg.sender].savingsBalance >= minimumSavingsForLoan, "Insufficient savings for loan eligibility");
        
        // Calculate monthly payment
        uint256 monthlyInterestRate = loanInterestRate / 12 / 10000;
        uint256 monthlyPayment = calculateMonthlyPayment(amount, monthlyInterestRate, termMonths);
        
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            interestRate: loanInterestRate,
            termMonths: termMonths,
            monthlyPayment: monthlyPayment,
            remainingBalance: amount,
            disbursedAt: 0,
            nextPaymentDue: 0,
            purpose: purpose,
            isActive: false
        });
        
        emit LoanRequested(msg.sender, amount, purpose);
        return loanId;
    }

    function approveLoan(uint256 loanId) external onlyAdmin {
        Loan storage loan = loans[loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isActive, "Loan already active");
        require(address(this).balance >= loan.amount, "Insufficient contract balance");
        
        loan.isActive = true;
        loan.disbursedAt = block.timestamp;
        loan.nextPaymentDue = block.timestamp + 30 days; // Next payment due in 30 days
        
        totalLoansIssued += loan.amount;
        payable(loan.borrower).transfer(loan.amount);
        
        emit LoanApproved(loan.borrower, loan.amount, loanId);
    }

    function repayLoan(uint256 loanId) external payable onlyActiveMember nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(loan.isActive, "Loan not active");
        require(msg.value > 0, "Payment must be greater than 0");
        require(msg.value <= loan.remainingBalance, "Payment exceeds remaining balance");
        
        loan.remainingBalance -= msg.value;
        
        if (loan.remainingBalance == 0) {
            loan.isActive = false;
        } else {
            loan.nextPaymentDue = block.timestamp + 30 days;
        }
        
        emit LoanRepaid(msg.sender, msg.value, loanId);
    }

    // Governance functions
    function createProposal(
        string memory title,
        string memory description,
        uint256 votingDuration
    ) external onlyActiveMember returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(votingDuration > 0 && votingDuration <= 30 days, "Invalid voting duration");
        
        uint256 proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        proposal.title = title;
        proposal.description = description;
        proposal.creator = msg.sender;
        proposal.deadline = block.timestamp + votingDuration;
        proposal.executed = false;
        
        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external onlyActiveMember {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.creator != address(0), "Proposal does not exist");
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.totalVotes++;
        
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit VoteCast(proposalId, msg.sender, support);
    }

    // Interest distribution
    function distributeInterest() external onlyAdmin {
        require(totalSavings > 0, "No savings to distribute interest on");
        
        uint256 interestAmount = (totalSavings * interestRate) / 10000 / 12; // Monthly interest
        require(address(this).balance >= interestAmount, "Insufficient contract balance for interest");
        
        uint256 memberCount = memberList.length;
        for (uint256 i = 0; i < memberCount; i++) {
            address memberAddress = memberList[i];
            Member storage member = members[memberAddress];
            
            if (member.isActive && member.savingsBalance > 0) {
                uint256 memberInterest = (member.savingsBalance * interestAmount) / totalSavings;
                member.savingsBalance += memberInterest;
            }
        }
        
        emit InterestDistributed(interestAmount, block.timestamp);
    }

    // Utility functions
    function calculateMonthlyPayment(
        uint256 principal,
        uint256 monthlyRate,
        uint256 termMonths
    ) internal pure returns (uint256) {
        if (monthlyRate == 0) {
            return principal / termMonths;
        }
        
        uint256 numerator = principal * monthlyRate * (1 + monthlyRate) ** termMonths;
        uint256 denominator = (1 + monthlyRate) ** termMonths - 1;
        return numerator / denominator;
    }

    // View functions
    function getMemberInfo(address memberAddress) external view returns (
        string memory memberId,
        uint256 savingsBalance,
        uint256 totalDeposits,
        uint256 totalWithdrawals,
        uint256 joinedAt,
        bool isActive
    ) {
        Member memory member = members[memberAddress];
        return (
            member.memberId,
            member.savingsBalance,
            member.totalDeposits,
            member.totalWithdrawals,
            member.joinedAt,
            member.isActive
        );
    }

    function getLoanInfo(uint256 loanId) external view returns (
        address borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 termMonths,
        uint256 monthlyPayment,
        uint256 remainingBalance,
        uint256 disbursedAt,
        uint256 nextPaymentDue,
        string memory purpose,
        bool isActive
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.borrower,
            loan.amount,
            loan.interestRate,
            loan.termMonths,
            loan.monthlyPayment,
            loan.remainingBalance,
            loan.disbursedAt,
            loan.nextPaymentDue,
            loan.purpose,
            loan.isActive
        );
    }

    function getProposalInfo(uint256 proposalId) external view returns (
        string memory title,
        string memory description,
        address creator,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 totalVotes,
        uint256 deadline,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.creator,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.totalVotes,
            proposal.deadline,
            proposal.executed
        );
    }

    function getTotalStats() external view returns (
        uint256 _totalSavings,
        uint256 _totalLoansIssued,
        uint256 _memberCount,
        uint256 _nextLoanId,
        uint256 _nextProposalId
    ) {
        return (
            totalSavings,
            totalLoansIssued,
            memberList.length,
            nextLoanId,
            nextProposalId
        );
    }

    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function isMember(address account) external view returns (bool) {
        return hasRole(MEMBER_ROLE, account);
    }

    // Emergency functions
    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function emergencyWithdraw() external onlyAdmin {
        payable(msg.sender).transfer(address(this).balance);
    }

    // Receive ETH
    receive() external payable {}
}
