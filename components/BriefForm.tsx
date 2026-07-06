"use client";

import { FormEvent, useState } from "react";
import {
  AdFormat,
  BriefInput,
  MarketCountry,
  ProductType,
  AD_FORMAT_LABELS,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface BriefFormProps {
  onSubmit: (brief: BriefInput) => void;
  initialValues?: Partial<BriefInput>;
}

interface FormErrors {
  nombre_producto?: string;
  tipo_producto?: string;
  precio?: string;
  link_venta?: string;
  pais_mercado?: string;
  formato_anuncio?: string;
}

const PRODUCT_TYPES: ProductType[] = ["Curso", "Ebook", "Podcast"];

const COUNTRIES: MarketCountry[] = [
  "Perú",
  "México",
  "Colombia",
  "Chile",
  "Argentina",
  "España",
];

const AD_FORMATS: AdFormat[] = ["1:1", "9:16", "1.91:1"];

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function BriefForm({ onSubmit, initialValues }: BriefFormProps) {
  const [nombreProducto, setNombreProducto] = useState(
    initialValues?.nombre_producto ?? ""
  );
  const [tipoProducto, setTipoProducto] = useState<ProductType>(
    initialValues?.tipo_producto ?? "Curso"
  );
  const [precio, setPrecio] = useState(
    initialValues?.precio?.toString() ?? ""
  );
  const [linkVenta, setLinkVenta] = useState(
    initialValues?.link_venta ?? ""
  );
  const [paisMercado, setPaisMercado] = useState<MarketCountry>(
    initialValues?.pais_mercado ?? "Perú"
  );
  const [formatoAnuncio, setFormatoAnuncio] = useState<AdFormat>(
    initialValues?.formato_anuncio ?? "1:1"
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!nombreProducto.trim()) {
      next.nombre_producto = "El nombre del producto es requerido";
    }
    if (!tipoProducto) {
      next.tipo_producto = "Selecciona un tipo de producto";
    }
    const precioNum = parseFloat(precio);
    if (!precio || isNaN(precioNum) || precioNum <= 0) {
      next.precio = "Ingresa un precio válido mayor a 0";
    }
    if (!linkVenta.trim()) {
      next.link_venta = "El link de venta es requerido";
    } else if (!isValidUrl(linkVenta.trim())) {
      next.link_venta = "Ingresa una URL válida (http:// o https://)";
    }
    if (!paisMercado) {
      next.pais_mercado = "Selecciona un país";
    }
    if (!formatoAnuncio) {
      next.formato_anuncio = "Selecciona un formato de anuncio";
    }

    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      nombre_producto: nombreProducto.trim(),
      tipo_producto: tipoProducto,
      precio: parseFloat(precio),
      link_venta: linkVenta.trim(),
      pais_mercado: paisMercado,
      formato_anuncio: formatoAnuncio,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nombre del producto"
          placeholder="Ej. Masterclass de Ventas Digitales"
          value={nombreProducto}
          onChange={(e) => setNombreProducto(e.target.value)}
          error={errors.nombre_producto}
        />

        <Select
          label="Tipo de producto"
          value={tipoProducto}
          onChange={(e) => setTipoProducto(e.target.value as ProductType)}
          error={errors.tipo_producto}
          options={PRODUCT_TYPES.map((t) => ({ value: t, label: t }))}
        />

        <Input
          label="Precio"
          type="number"
          min="1"
          step="0.01"
          placeholder="97.00"
          prefix="$"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          error={errors.precio}
          hint="Precio de venta en USD"
        />

        <Input
          label="Link de venta"
          type="url"
          placeholder="https://tu-producto.com/checkout"
          value={linkVenta}
          onChange={(e) => setLinkVenta(e.target.value)}
          error={errors.link_venta}
        />

        <div className="md:col-span-2 md:max-w-xs">
          <Select
            label="País del mercado"
            value={paisMercado}
            onChange={(e) => setPaisMercado(e.target.value as MarketCountry)}
            error={errors.pais_mercado}
            options={COUNTRIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-brand-white mb-1">
          Formato del anuncio
        </legend>
        {errors.formato_anuncio && (
          <p className="text-xs text-red-400 -mt-1">{errors.formato_anuncio}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AD_FORMATS.map((format) => {
            const isSelected = formatoAnuncio === format;
            const aspectClass =
              format === "1:1"
                ? "aspect-square"
                : format === "9:16"
                  ? "aspect-[9/16] max-h-24"
                  : "aspect-[1.91/1]";

            return (
              <button
                key={format}
                type="button"
                onClick={() => setFormatoAnuncio(format)}
                className={[
                  "flex flex-col items-center gap-3 p-4 border transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow",
                  isSelected
                    ? "border-brand-yellow bg-brand-yellow/5"
                    : "border-neutral-700 hover:border-neutral-500 bg-neutral-900/50",
                ].join(" ")}
                aria-pressed={isSelected}
              >
                <div
                  className={[
                    "w-full border border-neutral-600 bg-neutral-800",
                    aspectClass,
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-xs font-medium text-center",
                    isSelected ? "text-brand-yellow" : "text-neutral-400",
                  ].join(" ")}
                >
                  {AD_FORMAT_LABELS[format]}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button type="submit" fullWidth>
        Investigar y generar borrador
      </Button>
    </form>
  );
}
