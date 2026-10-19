import React from 'react'
import { Modal, Form, Input, Divider } from 'antd'



const OpdReceiptModal = ({ open, onCancel, form }) => {



    return (
        <Modal
            title="OPD receipt Issued"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Form form={form} layout="vertical">

                {/* Last Slip Issued - Readonly */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-4 rounded-xl mb-6 border border-blue-100/50">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-gray-700">OPD receipt</span>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Invoice Detail</span>
                    </div>

                    <Divider className="my-3" style={{ borderColor: '#e5e7eb' }} />

                    <div className="grid grid-cols-1 md:grid-cols-2  gap-x-4 gap-y-3">

                        <Form.Item
                            name="recieptNo"
                            label={<span className="text-xs font-semibold text-gray-600">Reciept #</span>}
                            className="mb-0"
                        >
                            <Input
                                placeholder="Reciept No"
                                className="rounded-lg hover:border-blue-400 focus:border-blue-500 text-gray-700!"
                                prefix={<span className="text-gray-400 text-xs">👤</span>}
                                disabled={true}
                            />
                        </Form.Item>

                        <Form.Item
                            name="mrNumber"
                            label={<span className="text-xs font-semibold text-gray-600">MR Number #</span>}
                            className="mb-0"
                        >
                            <Input
                                placeholder="MR Number"
                                className="rounded-lg hover:border-blue-400 focus:border-blue-500 text-gray-700!"
                                prefix={<span className="text-gray-400 text-xs">👤</span>}
                                disabled={true}
                            />
                        </Form.Item>

                        <Form.Item
                            name="tokenNo"
                            label={<span className="text-xs font-semibold text-gray-600 ">Token No</span>}
                            className="mb-0"
                        >
                            <Input
                                placeholder="Token No"
                                className="rounded-lg hover:border-blue-400 focus:border-blue-500 text-gray-700!"
                                prefix={<span className="text-gray-400 text-xs">✏️</span>}
                                disabled={true}
                            />
                        </Form.Item>

                        <Form.Item
                            name="createdBy"
                            label={<span className="text-xs font-semibold text-gray-600">Created By</span>}
                            className="mb-0"
                        >
                            <Input
                                placeholder="Created By"
                                className="rounded-lg hover:border-blue-400 focus:border-blue-500 text-gray-700!"
                                prefix={<span className="text-gray-400 text-xs">👤</span>}
                                disabled={true}
                            />
                        </Form.Item>

                        <Form.Item
                            name="editBy"
                            label={<span className="text-xs font-semibold text-gray-600">Edit By</span>}
                            className="mb-0"
                        >
                            <Input
                                placeholder="Edit By"
                                className="rounded-lg hover:border-blue-400 focus:border-blue-500 text-gray-700!"
                                prefix={<span className="text-gray-400 text-xs">✏️</span>}
                                disabled={true}
                            />
                        </Form.Item>

                    </div>

                </div>

            </Form>
        </Modal>
    )
}

export default OpdReceiptModal