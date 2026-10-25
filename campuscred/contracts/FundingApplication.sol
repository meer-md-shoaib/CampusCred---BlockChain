// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CampusToken.sol";
import "./StudentRegistry.sol";

contract FundingApplication {
    enum Status {
        Submitted,
        UnderReview,
        Approved,
        Rejected,
        Disbursed,
        Completed
    }

    struct Application {
        uint256 id;
        address student;
        string title;
        string reason;
        string documentCid;
        uint256 amount;
        Status status;
        uint256 approvalCount;
        bool exists;
    }

    CampusToken public token;
    StudentRegistry public registry;

    address public admin;
    address[] public reviewers;

    uint256 public nextApplicationId = 1;
    uint256 public requiredApprovals = 2;

    mapping(uint256 => Application) public applications;
    mapping(uint256 => mapping(address => bool)) public hasApproved;
    mapping(address => bool) public isReviewer;

    event ApplicationSubmitted(
        uint256 indexed applicationId,
        address indexed student,
        string title,
        uint256 amount,
        string documentCid
    );

    event ApplicationApproved(
        uint256 indexed applicationId,
        address indexed reviewer,
        uint256 approvalCount
    );

    event ApplicationRejected(
        uint256 indexed applicationId,
        address indexed reviewer
    );

    event FundsDisbursed(
        uint256 indexed applicationId,
        address indexed student,
        uint256 amount
    );

    event ReviewerAdded(address indexed reviewer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyReviewer() {
        require(isReviewer[msg.sender], "Only reviewer");
        _;
    }

    constructor(address _token, address _registry) {
        token = CampusToken(_token);
        registry = StudentRegistry(_registry);
        admin = msg.sender;

        reviewers.push(msg.sender);
        isReviewer[msg.sender] = true;
    }

    function addReviewer(address _reviewer) external onlyAdmin {
        require(_reviewer != address(0), "Invalid reviewer address");
        require(!isReviewer[_reviewer], "Already reviewer");

        reviewers.push(_reviewer);
        isReviewer[_reviewer] = true;

        emit ReviewerAdded(_reviewer);
    }

    function removeReviewer(address _reviewer) external onlyAdmin {
        require(isReviewer[_reviewer], "Not a reviewer");
        require(_reviewer != admin, "Cannot remove admin");
        isReviewer[_reviewer] = false;
    }

    function submitApplication(
        string memory _title,
        string memory _reason,
        string memory _documentCid,
        uint256 _amount
    ) external {
        require(
            registry.isStudentRegistered(msg.sender),
            "Register first"
        );

        require(bytes(_title).length > 0, "Title is required");
        require(bytes(_reason).length > 0, "Reason is required");
        require(_amount > 0, "Amount must be greater than zero");

        uint256 applicationId = nextApplicationId;

        applications[applicationId] = Application({
            id: applicationId,
            student: msg.sender,
            title: _title,
            reason: _reason,
            documentCid: _documentCid,
            amount: _amount,
            status: Status.Submitted,
            approvalCount: 0,
            exists: true
        });

        nextApplicationId++;

        emit ApplicationSubmitted(
            applicationId,
            msg.sender,
            _title,
            _amount,
            _documentCid
        );
    }

    function approveApplication(
        uint256 _applicationId
    ) external onlyReviewer {
        Application storage application = applications[_applicationId];

        require(application.exists, "Application not found");
        require(application.student != msg.sender, "Cannot approve own application");

        require(
            application.status == Status.Submitted ||
            application.status == Status.UnderReview,
            "Not reviewable"
        );

        require(
            !hasApproved[_applicationId][msg.sender],
            "Already approved"
        );

        hasApproved[_applicationId][msg.sender] = true;
        application.approvalCount++;

        if (application.status == Status.Submitted) {
            application.status = Status.UnderReview;
        }

        if (application.approvalCount >= requiredApprovals) {
            application.status = Status.Approved;
        }

        emit ApplicationApproved(
            _applicationId,
            msg.sender,
            application.approvalCount
        );
    }

    function rejectApplication(
        uint256 _applicationId
    ) external onlyReviewer {
        Application storage application = applications[_applicationId];

        require(application.exists, "Application not found");
        require(application.student != msg.sender, "Cannot approve own application");

        require(
            application.status == Status.Submitted ||
            application.status == Status.UnderReview,
            "Not reviewable"
        );

        application.status = Status.Rejected;

        emit ApplicationRejected(_applicationId, msg.sender);
    }

    function disburseFunds(
        uint256 _applicationId
    ) external onlyAdmin {
        Application storage application = applications[_applicationId];

        require(application.exists, "Application not found");
        require(application.student != msg.sender, "Cannot approve own application");
        require(application.status == Status.Approved, "Not approved");

        application.status = Status.Disbursed;

        bool transferred = token.transfer(
            application.student,
            application.amount
        );

        require(transferred, "Token transfer failed");

        emit FundsDisbursed(
            _applicationId,
            application.student,
            application.amount
        );
    }

    function completeApplication(
        uint256 _applicationId
    ) external onlyAdmin {
        Application storage application = applications[_applicationId];

        require(application.exists, "Application not found");
        require(application.student != msg.sender, "Cannot approve own application");
        require(
            application.status == Status.Disbursed,
            "Not disbursed"
        );

        application.status = Status.Completed;
    }

    function getApplication(
        uint256 _applicationId
    ) external view returns (Application memory) {
        require(
            applications[_applicationId].exists,
            "Application not found"
        );

        return applications[_applicationId];
    }

    function getApplicationDetails(
        uint256 _applicationId
    )
        external
        view
        returns (
            uint256 id,
            address student,
            string memory title,
            string memory reason,
            string memory documentCid,
            uint256 amount,
            uint8 status,
            uint256 approvalCount
        )
    {
        Application memory application = applications[_applicationId];

        require(application.exists, "Application not found");
        require(application.student != msg.sender, "Cannot approve own application");

        return (
            application.id,
            application.student,
            application.title,
            application.reason,
            application.documentCid,
            application.amount,
            uint8(application.status),
            application.approvalCount
        );
    }
}