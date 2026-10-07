"use client";
import { useContext } from "react";
import { GlobalContext } from "@/hooks/useContext";
import Input from "@/components/form/input";
import Select from "@/components/form/select";
export default function Page() {
  const { products, categories, brands } = useContext(GlobalContext);
  return (
    <div className="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <Input label="Name" name="name" type="text" />
          <Input label="Meta Description" name="metaDescription" type="text" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Tags" name="tag" type="text" />
          <Input label="Meta Keywords" name="metaKeywords" type="text" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Categorie" name="categorie" data={categories} />

          <Select label="Brand" name="brand" data={brands} />

          <div>
            <label
              htmlFor="HeadlineAct"
              className="block text-sm font-medium text-gray-900"
            >
              Publish
            </label>
            <select className="mt-1.5 w-full rounded-lg border-gray-300 text-gray-700 sm:text-sm">
              <option defaultValue="">Please select</option>
              <option value={0}>false</option>
              <option value={1}>true</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="HeadlineAct"
            className="block text-sm font-medium text-gray-900"
          >
            Images
          </label>
        </div>
        <div>
          <label htmlFor="message">Description</label>

          <textarea
            className="w-full rounded-lg border-gray-200 p-3 text-sm"
            placeholder="description"
            rows="8"
            id="description"
            defaultValue={products?.description}
          ></textarea>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
          >
            Send Enquiry
          </button>
        </div>
      </div>
      <pre> {JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}
