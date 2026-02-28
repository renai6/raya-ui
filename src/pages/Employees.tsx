import Header from "@/components/header/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChevronDown,
  ChevronDownIcon,
  ChevronUp,
  Download,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCreateEmployee } from "@/hooks/useCreateEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import {
  useUpdateEmployee,
  useUpdateEmployeeCreditStatus,
} from "@/hooks/useUpdateEmployee";
import { useAuthUser } from "@/stores/authStore";
import type { Employee } from "@/types";
import * as XLSX from "xlsx";
import { useState } from "react";
import { useCreateBulkEmployees } from "@/hooks/useCreateBulkEmployees";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteEmployee } from "@/hooks/useEmployee";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

const employeeDefaultValues = {
  employeeNumber: "",
  name: "",
  contactNumber: "",
  email: "",
  creditLimit: 1500,
};

const Employees = () => {
  const [startDate, setStartDate] = useState<undefined | Date>();
  const [endDate, setEndDate] = useState<undefined | Date>();

  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [isWithCreditOnly, setIsWithCreditOnly] = useState(false);

  const user = useAuthUser();
  const { data: employeesData, isLoading } = useEmployees(startDate, endDate);
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: createBulkEmployees } = useCreateBulkEmployees();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { mutate: updateEmployeeCreditStatus } =
    useUpdateEmployeeCreditStatus();
  const { mutate: deleteEmployee } = useDeleteEmployee();

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isCreatingBulkEmployees, setIsCreatingBulkEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [fileUploaded, setFileUploaded] = useState<any[]>([]);
  const [form, setForm] = useState<Employee>(employeeDefaultValues);

  const [deletingEmployeeNumber, setDeletingEmployeeNumber] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddEmployee = () => {
    setSelectedEmployee(null);
    setForm(employeeDefaultValues);
    setIsEmployeeDialogOpen(true);
  };

  const onEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setForm({
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      contactNumber: employee.contactNumber,
      email: employee.email,
      creditLimit: employee.creditLimit,
    });
    setIsEmployeeDialogOpen(true);
    setDeletingEmployeeNumber("");
    setIsDeleting(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee?.id) {
      if (form.employeeNumber !== selectedEmployee.employeeNumber) {
        toast.error("Employee Number cannot be updated.");
        return;
      }
      console.log({ ...form, id: selectedEmployee.id });
      updateEmployee({ ...form, id: selectedEmployee.id });
    } else {
      createEmployee(form);
    }
    setIsEmployeeDialogOpen(false);
    setForm(employeeDefaultValues);
  };

  const formHasAnyValue = Object.values(form).some((value) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    return false;
  });

  // Filter employees based on search term
  const filteredEmployees = Array.isArray(employeesData)
    ? employeesData.filter((employee: Employee) => {
        if (isWithCreditOnly) {
          const employeeCredit = employee.totalCredit || 0;

          return (
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            employeeCredit > 0
          );
        }

        return employee.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setFileUploaded(jsonData as any[]);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!fileUploaded || fileUploaded.length === 0) return;
    setIsCreatingBulkEmployees(true);
    // Assuming first row is headers, skip it
    const employees = fileUploaded.slice(1).map((row: any[]) => ({
      employeeNumber: row[0]?.toString() || "",
      name: row[1]?.toString() || "",
      contactNumber: row[2]?.toString() || "",
      email: row[3]?.toString() || "",
      creditLimit: row[4] ? Number(row[4]) : 1500,
      isPaid: row[5] ? row[5].toString().toLowerCase() === "true" : false,
    }));

    await createBulkEmployees(employees);

    setIsCreatingBulkEmployees(false);
    setIsEmployeeDialogOpen(false);
    setFileUploaded([]);

    toast.success("Bulk employees created successfully!");
  };

  const onEmployeeDialogClose = () => {
    setFileUploaded([]);
    setForm(employeeDefaultValues);
    setIsEmployeeDialogOpen(false);
  };

  const onDeleteEmployee = (id: string | undefined) => {
    if (!id) return;
    if (deletingEmployeeNumber !== selectedEmployee?.employeeNumber) return;
    if (user?.role === "CASHIER") return;
    deleteEmployee(id);

    onEmployeeDialogClose();

    toast.success("Employee deleted successfully!");
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Employee Number",
      "Name",
      "Contact Number",
      "Email",
      "Credit Limit",
      "Credit Paid Status (true/false)",
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeesTemplate");
    XLSX.writeFile(workbook, "EmployeesTemplate.xlsx");

    toast.success("Template downloaded successfully!");
  };

  const handleExport = () => {
    const headers = [
      "Employee Name",
      "Employee Number",
      "Contact",
      "Credit Limit",
      "Total Credit",
    ];
    const data = employeesData.map((employee: Employee) => [
      employee.name,
      employee.employeeNumber,
      employee.contactNumber,
      employee.creditLimit,
      employee.totalCredit,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(
      workbook,
      `employee-report${
        startDate ? `-${startDate?.toISOString().split("T")[0]}` : ""
      }${endDate ? `-${endDate?.toISOString().split("T")[0]}` : ""}.xlsx`,
    );
    toast.success("Employee report exported successfully!");
  };

  const handleCreditUpdate = () => {
    if (!selectedEmployee?.id) return;
    updateEmployeeCreditStatus(selectedEmployee);

    setIsEmployeeDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-[40rem] flex justify-center items-center flex-col gap-4">
        <Spinner className="size-10 text-amber-500" />
        <h2>Fetching Employees Data</h2>
      </div>
    );
  }

  return (
    <div>
      <Header title="Employee Management" user={{ email: user?.email }} />
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-3">
          <Label className="px-1">Select Date</Label>
          <div className="flex gap-2">
            <Popover
              open={isStartCalendarOpen}
              onOpenChange={setIsStartCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {startDate
                    ? new Date(startDate).toLocaleDateString()
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setStartDate(date || new Date());
                    setIsStartCalendarOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            <Popover
              open={isEndCalendarOpen}
              onOpenChange={setIsEndCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  captionLayout="dropdown"
                  disabled={(date) => (startDate ? date < startDate : false)}
                  onSelect={(date) => {
                    console.log(date || new Date());
                    setEndDate(date || new Date());
                    setIsEndCalendarOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="secondary"
              onClick={() => {
                setEndDate(undefined);
                setStartDate(undefined);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Checkbox
            id="prices-check"
            checked={isWithCreditOnly}
            onCheckedChange={(e) => setIsWithCreditOnly(e as boolean)}
          />
          <Label htmlFor="prices-check">With Credit Only</Label>
        </div>
      </div>

      <Card className="border-none mt-3 mb-4 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.75)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="mb-2">Employee List</h1>
              <small className="text-amber-500 text-xs">
                Shows a table of employees with total credit for this payroll
              </small>
            </div>

            <div className="flex gap-2">
              <Button variant="default" onClick={openAddEmployee}>
                <Plus className="w-4" />
                Create Employee
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                <Download className="w-4" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search employees..."
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-140 overflow-auto pr-2 custom-scrollbar">
            <Table>
              <TableHeader className="dark:bg-neutral-800">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee Number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Total Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees?.map((employee: Employee) => (
                  <TableRow
                    key={employee.id}
                    onClick={() => onEmployeeClick(employee)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell>{employee.employeeNumber}</TableCell>
                    <TableCell>{employee.contactNumber}</TableCell>
                    <TableCell>{employee.creditLimit}</TableCell>
                    <TableCell>{employee.totalCredit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isEmployeeDialogOpen}
        onOpenChange={() =>
          setIsEmployeeDialogOpen((prevState) => {
            if (prevState) {
              onEmployeeDialogClose();
            }
            return !prevState;
          })
        }
      >
        <DialogContent className="px-2">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee
                ? "Update the employee details below."
                : "Fill in the details to add a new employee."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto sm:max-w-lg px-2 custom-scrollbar">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="employeeNumber">
                  Employee Number
                </Label>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  value={form.employeeNumber}
                  onChange={handleFormChange}
                  required
                  disabled={
                    fileUploaded.length > 0 || isDeleting || !!selectedEmployee
                  }
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  disabled={fileUploaded.length > 0 || isDeleting}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="contactNumber">
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleFormChange}
                  disabled={fileUploaded.length > 0 || isDeleting}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  disabled={fileUploaded.length > 0 || isDeleting}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="creditLimit">
                  Credit Limit
                </Label>
                <Input
                  id="creditLimit"
                  name="creditLimit"
                  type="number"
                  value={form.creditLimit}
                  onChange={handleFormChange}
                  disabled={fileUploaded.length > 0 || isDeleting}
                />
              </div>

              {isDeleting ? null : (
                <div className="flex justify-end space-x-2">
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={fileUploaded.length > 0}
                  >
                    {selectedEmployee ? "Update" : "Add"}
                  </Button>
                </div>
              )}
            </form>
            {selectedEmployee && (
              <div className="p-3 border border-amber-500 rounded-sm my-4">
                <h3 className="text-amber-400 font-bold">Employee Credit</h3>
                <small className="text-gray-300">
                  Please proceed with caution. {form.name} has a total credit of{" "}
                  {selectedEmployee?.totalCredit || 0}.
                </small>

                <div className="flex justify-end">
                  <Button
                    className="mt-3"
                    variant="outline"
                    disabled={selectedEmployee?.totalCredit === 0}
                    onClick={handleCreditUpdate}
                  >
                    Set Credit Paid
                  </Button>
                </div>
              </div>
            )}
            {selectedEmployee || formHasAnyValue ? null : (
              <>
                <div>
                  <hr />
                </div>
                <div className="grid items-center gap-3 py-4">
                  <DialogTitle>Create or Update in bulk</DialogTitle>
                  <DialogDescription className="flex gap-2 flex-col">
                    <span>
                      Import employees in bulk using a CSV file. To avoid
                      errors, please use the provided template and follow the
                      required format.
                    </span>
                    <span
                      className="text-amber-500 cursor-pointer font-semibold underline"
                      onClick={handleDownloadTemplate}
                    >
                      Download Template
                    </span>
                  </DialogDescription>
                  <Label htmlFor="excel">
                    Import bulk employees via Excel file
                  </Label>
                  <Input
                    onChange={handleUpload}
                    id="excel"
                    type="file"
                    accept=".xlsx,.xls"
                  />
                  <Button
                    disabled={isCreatingBulkEmployees}
                    onClick={handleImport}
                  >
                    {isCreatingBulkEmployees ? (
                      <>
                        <Spinner />
                        Processing
                      </>
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
              </>
            )}

            {selectedEmployee?.id && (
              <Collapsible open={isDeleting} onOpenChange={setIsDeleting}>
                <CollapsibleTrigger className="w-full" asChild>
                  <Button variant="ghost" className="w-full text-red-300">
                    {isDeleting ? "Hide" : "Remove Employee"}{" "}
                    {isDeleting ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 border border-red-600 rounded-sm mt-4">
                    <h3 className="text-red-400 text-bold">Danger Zone</h3>
                    <small className="text-gray-300">
                      Please proceed with caution. Deleting this employee may
                      have serious consequences.
                    </small>

                    <div>
                      <Label className="mb-2 mt-4">
                        Please enter the employee number of the employee to be
                        deleted
                      </Label>
                      <Input
                        onChange={(e) =>
                          setDeletingEmployeeNumber(e.target.value)
                        }
                      />
                    </div>

                    <Button
                      className="mt-3 w-full"
                      variant="destructive"
                      onClick={() => onDeleteEmployee(selectedEmployee.id)}
                      disabled={
                        deletingEmployeeNumber !==
                        selectedEmployee.employeeNumber
                      }
                    >
                      Delete Employee
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
