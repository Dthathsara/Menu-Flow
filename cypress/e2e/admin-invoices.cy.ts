/**
 * @file admin-invoices.cy.ts
 * @description Cypress End-to-End E2E Test Suite for System Admin Invoices tab.
 * Validates backend endpoints stubbing, metric stat cards rendering, table rendering,
 * search filtering, and Add Invoice modal creation workflow.
 */

describe("System Admin — Invoices Tab E2E Test Suite", () => {
  const mockInvoiceData = {
    invoices: [
      {
        id: "inv-uuid-1",
        invoiceId: "INV-2026-001",
        clientId: "client-uuid-1",
        clientName: "Ocean Pearl Hotel",
        manager: {
          id: "mgr-uuid-1",
          name: "John Doe",
          email: "john@oceanpearl.com",
          phone: "+94771234567",
        },
        amount: 48500,
        dueDate: "2026-05-18",
        billingDate: "2026-05-01",
        status: "Paid",
        planName: "Pro Monthly Plan",
        packageId: "pkg-pro",
        billingCycle: "Monthly",
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "inv-uuid-2",
        invoiceId: "INV-2026-002",
        clientId: "client-uuid-2",
        clientName: "Cafe Noir",
        manager: {
          id: "mgr-uuid-2",
          name: "Sarah Smith",
          email: "sarah@cafenoir.com",
        },
        amount: 14500,
        dueDate: "2026-05-20",
        billingDate: "2026-05-05",
        status: "Pending",
        planName: "Starter Plan",
        packageId: "pkg-starter",
        billingCycle: "Monthly",
        createdAt: "2026-05-05T10:00:00.000Z",
        updatedAt: "2026-05-05T10:00:00.000Z",
      },
    ],
    stats: {
      monthlyTotalAmount: 63000,
      totalPaidAmount: 48500,
      totalPaidCount: 1,
      totalPendingAmount: 14500,
      totalPendingCount: 1,
    },
    total: 2,
  };

  const mockClients = [
    {
      id: "client-uuid-1",
      restaurantName: "Ocean Pearl Hotel",
      ownerName: "John Doe",
      loginEmail: "john@oceanpearl.com",
    },
    {
      id: "client-uuid-2",
      restaurantName: "Cafe Noir",
      ownerName: "Sarah Smith",
      loginEmail: "sarah@cafenoir.com",
    },
  ];

  beforeEach(() => {
    // Intercept backend API GET requests
    cy.intercept("GET", "**/api/v1/admin_invoice*", {
      statusCode: 200,
      body: mockInvoiceData,
    }).as("getAdminInvoices");

    cy.intercept("GET", "**/api/v1/system-admin/clients*", {
      statusCode: 200,
      body: mockClients,
    }).as("getAdminClients");

    // Visit admin dashboard
    cy.visit("/admin");
  });

  it("should display the 3 metric statistic cards with accurate values", () => {
    cy.wait("@getAdminInvoices");

    // Verify Total Invoice Value card
    cy.contains("Total Invoice Value").parent().should("contain.text", "Rs. 63,000");

    // Verify Paid card
    cy.contains("Paid").parent().should("contain.text", "Rs. 48,500").should("contain.text", "1 invoice");

    // Verify Pending card
    cy.contains("Pending").parent().should("contain.text", "Rs. 14,500").should("contain.text", "1 invoice");
  });

  it("should render table rows and format LKR amounts correctly", () => {
    cy.wait("@getAdminInvoices");

    // Verify invoice count
    cy.get("table tbody tr").should("have.length", 2);

    // Verify row 1 contents
    cy.contains("INV-2026-001").should("exist");
    cy.contains("Ocean Pearl Hotel").should("exist");
    cy.contains("John Doe").should("exist");
    cy.contains("john@oceanpearl.com").should("exist");
    cy.contains("Rs. 48,500.00").should("exist");

    // Verify status badge
    cy.contains("Paid").should("exist");
  });

  it("should filter table rows dynamically based on search input", () => {
    cy.wait("@getAdminInvoices");

    // Type search query
    cy.get("input[placeholder*='Filter']").type("Cafe Noir");

    // Verify table filters down to matching row
    cy.get("table tbody tr").should("have.length", 1);
    cy.contains("Cafe Noir").should("exist");
    cy.contains("Ocean Pearl Hotel").should("not.exist");
  });

  it("should open Add Invoice modal, validate payload, and POST to backend", () => {
    cy.wait("@getAdminInvoices");

    // Intercept POST creation endpoint
    cy.intercept("POST", "**/api/v1/admin_invoice", {
      statusCode: 201,
      body: {
        id: "inv-uuid-3",
        invoiceId: "INV-2026-003",
        clientId: "client-uuid-1",
        clientName: "Ocean Pearl Hotel",
        manager: {
          id: "mgr-uuid-1",
          name: "John Doe",
          email: "john@oceanpearl.com",
        },
        amount: 25000,
        dueDate: "2026-06-01",
        billingDate: "2026-05-21",
        status: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).as("createInvoice");

    // Click + Add Invoice button
    cy.contains("+ Add Invoice").click();

    // Verify modal title
    cy.contains("Add Invoice Details").should("be.visible");

    // Fill form inputs
    cy.get("select").select("client-uuid-1");
    cy.get("input[placeholder*='48500']").type("25000");
    cy.get("input[type='date']").type("2026-06-01");

    // Submit form
    cy.contains("Save Invoice").click();

    // Verify POST payload request
    cy.wait("@createInvoice").its("request.body").should("deep.include", {
      clientId: "client-uuid-1",
      amount: 25000,
      dueDate: "2026-06-01",
      status: "Pending",
    });
  });
});
