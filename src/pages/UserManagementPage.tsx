import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole, Hospital } from '../types/emergency';
import { fetchUsersApi, createUserApi, updateUserApi, deleteUserApi } from '../services/api';
import { Users, UserPlus, ShieldAlert, Key, Edit, Trash2, CheckCircle2, XCircle, Search, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const UserManagementPage: React.FC<{ hospitals: Hospital[] }> = ({ hospitals }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('fr_dispatch');
  const [agencyName, setAgencyName] = useState('');
  const [hospitalId, setHospitalId] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsersApi();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('fr_dispatch');
    setAgencyName('');
    setHospitalId(hospitals[0]?.id || 1);
    setPhone('');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(''); // Leave blank if un-changed
    setFullName(u.full_name);
    setRole(u.role);
    setAgencyName(u.agency_name || '');
    setHospitalId(u.hospital_id || '');
    setPhone(u.phone || '');
    setIsActive(u.is_active);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !fullName || (!editingUser && !password)) {
      MySwal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอก Username, รหัสผ่าน และชื่อ-นามสกุล',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedHosp = hospitals.find((h) => h.id === Number(hospitalId));
      if (editingUser) {
        await updateUserApi(editingUser.id, {
          full_name: fullName,
          role,
          agency_name: agencyName,
          hospital_id: hospitalId ? Number(hospitalId) : null,
          hospital_name: selectedHosp ? selectedHosp.name : '',
          phone,
          is_active: isActive,
          password: password || undefined,
        });
        MySwal.fire({ icon: 'success', title: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
      } else {
        await createUserApi({
          username,
          password,
          full_name: fullName,
          role,
          agency_name: agencyName,
          hospital_id: hospitalId ? Number(hospitalId) : null,
          hospital_name: selectedHosp ? selectedHosp.name : '',
          phone,
        });
        MySwal.fire({ icon: 'success', title: 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      MySwal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.message, confirmButtonColor: '#ef4444' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: UserAccount) => {
    const res = await MySwal.fire({
      title: `ยืนยันการลบผู้ใช้ ${u.username}?`,
      text: `ชื่อผู้ใช้: ${u.full_name} - การดำเนินการนี้จะไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันลบผู้ใช้งาน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (res.isConfirmed) {
      try {
        await deleteUserApi(u.id);
        MySwal.fire({ icon: 'success', title: 'ลบผู้ใช้งานเรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
        loadUsers();
      } catch (err: any) {
        MySwal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.message, confirmButtonColor: '#ef4444' });
      }
    }
  };

  const handleToggleActive = async (u: UserAccount) => {
    if (u.username === 'admin') {
      MySwal.fire({
        icon: 'warning',
        title: 'ไม่อนุญาตให้ปิดใช้งาน',
        text: 'บัญชี ผู้ดูแลระบบหลัก (admin) ไม่สามารถปิดการใช้งานได้',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    const newStatus = !u.is_active;
    // Optimistic UI update
    setUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_active: newStatus } : item));

    try {
      await updateUserApi(u.id, { is_active: newStatus });
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: newStatus ? `อนุมัติเปิดใช้งานบัญชี ${u.username}` : `ปิดใช้งานบัญชี ${u.username}`,
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err: any) {
      // Revert on error
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_active: !newStatus } : item));
      MySwal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', text: err.message, confirmButtonColor: '#ef4444' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (u.username ?? '').toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.agency_name ?? '').toLowerCase().includes(q);
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold px-2 py-0.5 rounded-md">ผู้ดูแลระบบ (Admin)</span>;
      case 'fr_dispatch':
        return <span className="bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold px-2 py-0.5 rounded-md">เจ้าหน้าที่แจ้งเหตุ (FR)</span>;
      case 'er_staff':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-md">เจ้าหน้าที่ ER</span>;
      case 'director':
        return <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-md">ผู้บริหาร (Director)</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 uppercase tracking-wide">
            System Administration
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>จัดการผู้ใช้งานและสิทธิระบบ (User Access Control)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่ม แก้ไข กำหนดบทบาทสิทธิการใช้งาน และเปิด/ปิดสถานะบัญชีผู้ใช้ในระบบ
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามชื่อ, username, หรือหน่วยงาน..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md pl-9 pr-3 py-2 outline-none font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600">กรองตามสิทธิ:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-3 py-2 font-medium outline-none"
          >
            <option value="all">ทุกสิทธิการใช้งาน ({users.length})</option>
            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            <option value="fr_dispatch">เจ้าหน้าที่แจ้งเหตุ (FR)</option>
            <option value="er_staff">เจ้าหน้าที่ ER</option>
            <option value="director">ผู้บริหาร (Director)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">Username / ชื่อ-สกุล</th>
                <th className="p-3">สิทธิบทบาท (Role)</th>
                <th className="p-3">สังกัดหน่วยงาน / รพ.</th>
                <th className="p-3">เบอร์โทรศัพท์</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                    กำลังโหลดข้อมูลผู้ใช้งาน...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                    ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{u.username}</div>
                    </td>
                    <td className="p-3">{getRoleBadge(u.role)}</td>
                    <td className="p-3">
                      <div>{u.agency_name || '-'}</div>
                      {u.hospital_name && <div className="text-[11px] text-slate-500">{u.hospital_name}</div>}
                    </td>
                    <td className="p-3 font-mono">{u.phone || '-'}</td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          disabled={u.username === 'admin'}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            u.is_active ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={u.is_active ? 'คลิกเพื่อปิดใช้งานบัญชี' : 'คลิกเพื่ออนุมัติเปิดใช้งานบัญชี'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] ${
                              u.is_active ? 'translate-x-5 text-emerald-600' : 'translate-x-0 text-slate-400'
                            }`}
                          >
                            {u.is_active ? '✓' : '✕'}
                          </span>
                        </button>
                        <span className={`text-[10px] font-bold ${u.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {u.is_active ? 'เปิดใช้งาน' : 'รออนุมัติ / ปิด'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          title="แก้ไขผู้ใช้งาน"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                            title="ลบผู้ใช้งาน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>{editingUser ? `แก้ไขผู้ใช้งาน: ${editingUser.username}` : 'เพิ่มผู้ใช้งานใหม่'}</span>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    disabled={Boolean(editingUser)}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสผ่าน {editingUser && <span className="font-normal text-slate-400">(เว้นไว้ถ้าไม่เปลี่ยน)</span>}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น นายสมชาย ใจดี"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">บทบาทสิทธิ (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="fr_dispatch">เจ้าหน้าที่แจ้งเหตุ (FR)</option>
                    <option value="er_staff">เจ้าหน้าที่ ER</option>
                    <option value="director">ผู้บริหาร (Director)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081-xxx-xxxx"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อหน่วยงาน / สังกัด</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="เช่น ศูนย์กู้ชีพเทศบาลตำบลกมลาไสย"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">โรงพยาบาลหลักสังกัด</label>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none font-medium"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="user_active_chk"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="user_active_chk" className="font-bold text-slate-700">
                    เปิดใช้งานบัญชีผู้ใช้นี้
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs shadow-sm"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
