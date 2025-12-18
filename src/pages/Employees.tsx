import Header from "@/components/header/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCreateEmployee } from "@/hooks/useCreateEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import { useUpdateEmployee } from "@/hooks/useUpdateEmployee";
import { useAuthUser } from "@/stores/authStore";
import type { Employee } from "@/types";
import { useState } from "react";

const Employees = () => {
  const [page, setPage] = useState(1);
  const user = useAuthUser();
  const { data: employeesData } = useEmployees(page);
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();

  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
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

  const onPageChange = (newPage: number) => {
    if (newPage === 0 || employeesData?.count < (newPage - 1) * 10) return;
    setPage(newPage);
  };

  // Filter employees based on search term
  const filteredEmployees = employeesData?.filter((employee: Employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Header title="Employee Management" user={{ email: user?.email }} />

      <Card className="mt-3 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="mb-2">Employee List</h1>
              <small className="text-yellow-500 text-xs">
                Shows a table of employees with total credit for this payroll
              </small>
            </div>
            <Button variant="default" onClick={openAddEmployee}>
              Add Employee
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search employees..."
            className="mb-4"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Number</TableHead>
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
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.employeeNumber}</TableCell>
                  <TableCell>{employee.contactNumber}</TableCell>
                  <TableCell>{employee.totalCredit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  role="button"
                  onClick={() => onPageChange(page - 1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  role="button"
                  onClick={() => onPageChange(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Dialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
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
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEmployeeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedEmployee ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
