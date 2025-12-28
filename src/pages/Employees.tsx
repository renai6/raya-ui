import Header from "@/components/header/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus } from "lucide-react";
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
import { useCreateEmployee } from "@/hooks/useCreateEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import { useUpdateEmployee } from "@/hooks/useUpdateEmployee";
import { useAuthUser } from "@/stores/authStore";
import type { Employee } from "@/types";
import * as XLSX from "xlsx";
import { useState } from "react";
import { useCreateBulkEmployees } from "@/hooks/useCreateBulkEmployees";
import { Spinner } from "@/components/ui/spinner";

const Employees = () => {
  const user = useAuthUser();
  const { data: employeesData } = useEmployees();
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: createBulkEmployees } = useCreateBulkEmployees();
  const { mutate: updateEmployee } = useUpdateEmployee();

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isCreatingBulkEmployees, setIsCreatingBulkEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [fileUploaded, setFileUploaded] = useState<any[]>([]);
  const [form, setForm] = useState<Employee>({
    employeeNumber: "",
    name: "",
    contactNumber: "",
    email: "",
  });

  const openAddEmployee = () => {
    setSelectedEmployee(null);
    setForm({
      employeeNumber: "",
      name: "",
      contactNumber: "",
      email: "",
    });
    setIsEmployeeDialogOpen(true);
  };

  const onEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setForm({
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      contactNumber: employee.contactNumber,
      email: employee.email,
    });
    setIsEmployeeDialogOpen(true);
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
      updateEmployee({ ...form, id: selectedEmployee.id });
    } else {
      createEmployee(form);
    }
    setIsEmployeeDialogOpen(false);
    setForm({
      employeeNumber: "",
      name: "",
      contactNumber: "",
      email: "",
    });
  };

  const formHasAnyValue = Object.values(form).some(
    (value) => value.trim() !== ""
  );

  // Filter employees based on search term
  const filteredEmployees = Array.isArray(employeesData)
    ? employeesData.filter((employee: Employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
    }));

    await createBulkEmployees(employees);

    setIsCreatingBulkEmployees(false);
    setIsEmployeeDialogOpen(false);
    setFileUploaded([]);
  };

  const onEmployeeDialogClose = () => {
    setFileUploaded([]);
    setForm({
      employeeNumber: "",
      name: "",
      contactNumber: "",
      email: "",
    });
    setIsEmployeeDialogOpen(false);
  };

  return (
    <div>
      <Header title="Employee Management" user={{ email: user?.email }} />

      <Card className="border-none mt-3 mb-4 gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.75)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="mb-2">Employee List</h1>
              <small className="text-yellow-500 text-xs">
                Shows a table of employees with total credit for this payroll
              </small>
            </div>
            <Button variant="default" onClick={openAddEmployee}>
              <Plus className="w-4" />
              Create Employee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search employees..."
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-150 overflow-auto pr-2 custom-scrollbar">
            <Table>
              <TableHeader className="dark:bg-neutral-800">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee Number</TableHead>
                  <TableHead>Contact</TableHead>
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
        <DialogContent>
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
                disabled={fileUploaded.length > 0}
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
                disabled={fileUploaded.length > 0}
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
                required
                disabled={fileUploaded.length > 0}
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
                required
                disabled={fileUploaded.length > 0}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onEmployeeDialogClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={fileUploaded.length > 0}>
                {selectedEmployee ? "Update" : "Add"}
              </Button>
            </div>
          </form>

          {selectedEmployee || formHasAnyValue ? null : (
            <>
              <div>
                <hr />
              </div>
              <div className="grid items-center gap-3 py-4">
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
