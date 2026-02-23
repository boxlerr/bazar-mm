'use client';

import { useState, useEffect, useMemo } from 'react';
import { PDFTemplate } from '@/types/pdf_template';
import { Upload, FileText, Check, Play, Save, Info, RefreshCw, ChevronDown, ChevronUp, AlertCircle, HelpCircle, X, Plus, Trash2, ArrowRight, Bug, PlayCircle } from 'lucide-react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface PDFTemplateEditorProps {
    initialData?: PDFTemplate;
    onSave: (data: Partial<PDFTemplate>) => void;
    onCancel?: () => void;
    initialFile?: File;
}

// Column Types for Visual Builder
type ColumnType = 'text' | 'number' | 'price' | 'sku' | 'ignore';

// Preview Tab Types
type PreviewTab = 'datos' | 'pdf';

interface ColumnDef {
    id: string;
    type: ColumnType;
    label: string;
}

export default function PDFTemplateEditor({ initialData, onSave, onCancel, initialFile }: PDFTemplateEditorProps) {
    const [name, setName] = useState(initialData?.nombre || '');
    const [keywords, setKeywords] = useState(initialData?.detect_keywords?.join(', ') || '');
    const [active, setActive] = useState(initialData?.activo ?? true);

    const [headerConfig, setHeaderConfig] = useState(initialData?.header_config || {
        order_regex: 'Orden\\s*(?:No:?)?\\s*#?(\\d+)',
        date_regex: '(\\d{2}/\\d{2}/\\d{4})',
        total_regex: 'Total:?\\s*\\$?\\s*([\\d.,]+)'
    });

    const [productsConfig, setProductsConfig] = useState(initialData?.products_config || {
        table_start_marker: 'Descripcion',
        table_end_marker: 'Subtotal',
        line_regex: '^(\\d+)\\s+(.+?)\\s+([\\d.,]+)$',
        field_mapping: { qty: 1, description: 2, price: 3 } // Default mapping
    });

    // Visual Builder State
    const [columns, setColumns] = useState<ColumnDef[]>([]);

    useEffect(() => {
        setColumns([
            { id: '1', type: 'text', label: 'Descripción' },
            { id: '2', type: 'number', label: 'Cantidad' },
            { id: '3', type: 'price', label: 'Precio Unit' },
            { id: '4', type: 'price', label: 'Total' }
        ]);
    }, []);

    // UX States
    const [showAdvanced, setShowAdvanced] = useState(false); // regex mode
    const [showDebug, setShowDebug] = useState(false); // New debug mode
    const [showGuide, setShowGuide] = useState(false);

    // Preview State
    const [previewTab, setPreviewTab] = useState<PreviewTab>('datos');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showResumeBubble, setShowResumeBubble] = useState(false);

    // Testing State
    const [loadedFile, setLoadedFile] = useState<File | null>(null);
    const [rawText, setRawText] = useState('');
    const [testResult, setTestResult] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Effect to process initial file if provided
    useEffect(() => {
        if (initialFile) {
            setLoadedFile(initialFile);
            const url = URL.createObjectURL(initialFile);
            setPdfUrl(url);
            processFile(initialFile);
        }

        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [initialFile]);

    // Auto-run test when rawText is available (e.g. after upload)
    useEffect(() => {
        if (rawText) {
            runTest();
        }
    }, [rawText, headerConfig, productsConfig]);

    // Tutorial State
    const startTour = (startStep = 0) => {
        const driverObj = driver({
            showProgress: true,
            showButtons: ['next', 'previous'],
            nextBtnText: 'Siguiente &rarr;',
            prevBtnText: '&larr; Atrás',
            doneBtnText: 'Finalizar',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            steps: [
                {
                    element: '.tour-basic-info',
                    popover: {
                        title: '1. Información Básica y Auto-detección',
                        description: 'Aquí definís el <b>Nombre</b> (ej: <i>"Factura Mayorista XYZ"</i>) y las <b>Palabras Clave</b>. <br/><br/>Las palabras clave son importantísimas: sirven para que el sistema reconozca automáticamente este PDF en el futuro. Usá datos únicos como el <b>CUIT del proveedor</b> (ej: <i>"CUIT 30-12345678-9"</i>) o su razón social.',
                        side: "bottom"
                    }
                },
                {
                    element: '.tour-reading-rules',
                    popover: {
                        title: '2. Reglas de Lectura (Dónde buscar)',
                        description: 'El sistema necesita saber dónde empieza y dónde termina la lista de productos.<br/><br/><b>Inicio:</b> Copiá la palabra exacta que está justo arriba del primer producto (ej: <i>"Descripción"</i> o <i>"Detalle"</i>).<br/><b>Fin:</b> Copiá la palabra que aparece justo después del último producto (ej: <i>"Subtotal"</i> o <i>"Total General"</i>).',
                        side: "bottom"
                    }
                },
                {
                    element: '.tour-columns',
                    popover: {
                        title: '3. Constructor de Columnas',
                        description: '¡Esta es la magia! Mirá tu PDF y <b>recreá el mismo orden de izquierda a derecha</b> que ves en las columnas de productos.<br/><br/>Si tu PDF dice: <code>[Cant] [Descripción] [Precio] [Total]</code>, entonces agrega los bloques en ese exacto orden. Podés arrastrarlos para acomodarlos o borrarlos si te equivocaste.',
                        side: "right"
                    }
                },
                {
                    element: '.tour-test-file',
                    popover: {
                        title: '4. Archivo de Prueba',
                        description: 'Subí una factura real en PDF de este proveedor. <br/><br/>Esto no va a impactar tu stock, es solo para probar en tiempo real si el sistema logra "leerla" usando las reglas que configuraste en los pasos anteriores.',
                        side: "left"
                    }
                },
                {
                    element: '.tour-preview-tabs',
                    popover: {
                        title: '5. Verificación de Datos',
                        description: 'Cambiá entre las pestañas para comparar.<br/><br/>Si la pestaña <b>"Datos Extraídos"</b> muestra correctamente la lista de productos, con sus cantidades y precios separados, ¡entonces configuraste todo perfecto!',
                        side: "left"
                    }
                },
                {
                    element: '.tour-save',
                    popover: {
                        title: '6. Guardar Plantilla',
                        description: 'Una vez que el PDF de prueba cargue perfecto, hacé clic en guardar.<br/><br/>¡Listo! A partir de ahora, cada vez que subas una factura de este proveedor en el área de Compras, el sistema hará todo el trabajo pesado por vos automáticamente.',
                        side: "top"
                    }
                }
            ],
            // Inyectar custom UI
            onPopoverRender: (popover, { config, state }) => {
                const isLastStep = state.activeIndex === config.steps!.length - 1;

                // --- ESTILOS DEL CONTENEDOR PRINCIPAL (POPOVER) ---
                const wrapper = popover.wrapper;
                wrapper.style.width = '420px';
                wrapper.style.padding = '15px';
                wrapper.style.borderRadius = '12px';

                // --- ESTILOS DE LA DESCRIPCIÓN ---
                const description = popover.description;
                if (description) {
                    description.style.fontSize = '0.9rem';
                    description.style.lineHeight = '1.6';
                    description.style.marginTop = '10px';
                }

                // 1. Botón Siguiente Celeste (Blue-500)
                const nextBtn = popover.nextButton;
                if (nextBtn) {
                    nextBtn.style.backgroundColor = '#3b82f6'; // Celeste/Azul Vaxler
                    nextBtn.style.color = 'white';
                    nextBtn.style.textShadow = 'none';
                    nextBtn.style.border = 'none';
                    nextBtn.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    nextBtn.style.borderRadius = '0.5rem';
                    nextBtn.style.padding = '0.5rem 1rem';
                }

                // 2. Estilizar Botón Atrás
                const prevBtn = popover.previousButton;
                if (prevBtn) {
                    prevBtn.style.backgroundColor = '#f3f4f6';
                    prevBtn.style.color = '#4b5563';
                    prevBtn.style.border = 'none';
                    prevBtn.style.textShadow = 'none';
                    prevBtn.style.borderRadius = '0.5rem';
                    prevBtn.style.padding = '0.5rem 1rem';
                }

                // Ocultar contador de progreso default abajo a la izquierda
                const progress = popover.wrapper.querySelector('.driver-popover-progress-text');
                if (progress) {
                    (progress as HTMLElement).style.display = 'none';
                }

                // 3. Crear botón "Omitir tutorial" en el Header sin romper el flex de Driver
                const titleElement = popover.title;
                if (titleElement) {
                    // Evitar duplicados
                    const oldSkip = titleElement.querySelector('.custom-skip-btn');
                    if (oldSkip) oldSkip.remove();

                    // Forzar que el título tenga posición relativa para poder anclar el botón Omitir
                    titleElement.style.position = 'relative';
                    titleElement.style.display = 'block'; // Ensure it spans to allow absolute positioning on right
                    titleElement.style.paddingRight = '90px'; // Asegurar espacio para que el botón no pise el texto
                    titleElement.style.fontSize = '1.1rem';
                    titleElement.style.lineHeight = '1.4';

                    if (!isLastStep) {
                        const skipBtn = document.createElement("button");
                        skipBtn.innerText = "Omitir tutorial";
                        skipBtn.className = "custom-skip-btn";

                        // Estilos para ubicarlo a la derecha del título
                        skipBtn.style.position = 'absolute';
                        skipBtn.style.right = '0';
                        skipBtn.style.top = '50%';
                        skipBtn.style.transform = 'translateY(-50%)';

                        // Estilos visuales
                        skipBtn.style.color = '#9ca3af'; // Gray-400
                        skipBtn.style.fontSize = '0.75rem';
                        skipBtn.style.fontWeight = '600';
                        skipBtn.style.border = 'none';
                        skipBtn.style.outline = 'none';
                        skipBtn.style.backgroundColor = 'transparent';
                        skipBtn.style.cursor = 'pointer';
                        skipBtn.style.padding = '0';
                        skipBtn.style.marginRight = '12px'; // Alejar un poco del borde

                        skipBtn.onmouseover = () => skipBtn.style.color = '#ef4444'; // Hover rojo
                        skipBtn.onmouseout = () => skipBtn.style.color = '#9ca3af';

                        skipBtn.onclick = () => {
                            localStorage.setItem('bazar-pdf-tour-completed', 'true');
                            driverObj.destroy();
                        };

                        titleElement.appendChild(skipBtn);
                    }
                }
            },
            onDestroyStarted: () => {
                const currentStep = driverObj.getActiveIndex() || 0;
                // Si el usuario cierra el modal a mitad de camino, guardamos en qué paso quedó
                const isLastStep = currentStep === 5; // 0-indexed, 6 steps total

                if (isLastStep) {
                    localStorage.setItem('bazar-pdf-tour-completed', 'true');
                    localStorage.removeItem('bazar-pdf-tour-last-step');
                    setShowResumeBubble(false);
                } else {
                    localStorage.setItem('bazar-pdf-tour-last-step', currentStep.toString());
                    setShowResumeBubble(true); // Mostrar burbuja para retomar
                }
                driverObj.destroy();
            },
            onNextClick: () => {
                driverObj.moveNext();
                const step = driverObj.getActiveIndex();
                if (step) localStorage.setItem('bazar-pdf-tour-last-step', step.toString());
            },
            onPrevClick: () => {
                driverObj.movePrevious();
                const step = driverObj.getActiveIndex();
                if (step) localStorage.setItem('bazar-pdf-tour-last-step', step.toString());
            }
        });

        driverObj.drive(startStep);
    };

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('bazar-pdf-tour-completed');
        if (!hasSeenTour) {
            // Check if there is a saved step to resume from
            const savedStep = localStorage.getItem('bazar-pdf-tour-last-step');

            if (savedStep) {
                // If there's a saved step, they previously closed it midway. Don't force auto-start, show the bubble.
                setShowResumeBubble(true);
            } else {
                // First time ever, auto-start after modal fade-in
                const timer = setTimeout(() => {
                    startTour(0);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // Sync Visual Builder to Regex
    useEffect(() => {
        if (!showAdvanced) {
            const { regex, mapping } = generateRegexFromColumns(columns);
            setProductsConfig(prev => ({
                ...prev,
                line_regex: regex,
                field_mapping: mapping
            }));
        }
    }, [columns, showAdvanced]);

    // --- DEBUGGER LOGIC ---
    // Extract the first candidate line to show in debug
    const debugLineInfo = useMemo(() => {
        if (!rawText) return null;
        const lines = rawText.split('\n').map(l => l.trim());
        const startMarker = productsConfig.table_start_marker;
        let foundStart = false;
        let candidateLine = '';

        for (const line of lines) {
            if (!foundStart && startMarker && line.includes(startMarker)) {
                foundStart = true;
                continue;
            }
            if (!startMarker) foundStart = true;

            if (foundStart) {
                // Skip empty lines or separator lines
                if (line.match(/^[\s-]*$/)) continue;
                if (line.includes(productsConfig.table_end_marker)) break;

                candidateLine = line;
                break;
            }
        }

        if (!candidateLine) return { status: 'No se encontró ninguna línea de producto después del marcador de inicio.' };

        // Test Regex
        try {
            const regex = new RegExp(productsConfig.line_regex);
            const match = candidateLine.match(regex);
            return {
                line: candidateLine,
                match: match ? 'MATCH' : 'NO MATCH',
                groups: match ? match.slice(1) : []
            };
        } catch (e) {
            return { status: 'Error en Regex', error: typeof e === 'string' ? e : 'Inválido' };
        }
    }, [rawText, productsConfig.line_regex, productsConfig.table_start_marker, productsConfig.table_end_marker]);


    const processFile = async (file: File) => {
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('extractTextOnly', 'true');

        try {
            const res = await fetch('/api/compras/pdf/test', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.text) {
                setRawText(data.text);
            }
        } catch (err) {
            console.error(err);
            alert('Error al leer PDF');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }

        const newUrl = URL.createObjectURL(file);
        setPdfUrl(newUrl);
        setLoadedFile(file);
        processFile(file);
    };

    const runTest = () => {
        if (!rawText) return;

        fetch('/api/compras/pdf/test-parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: rawText,
                template: {
                    header_config: headerConfig,
                    products_config: {
                        ...productsConfig,
                        field_mapping: {
                            qty: Number(productsConfig.field_mapping.qty),
                            description: Number(productsConfig.field_mapping.description),
                            price: Number(productsConfig.field_mapping.price),
                            sku: productsConfig.field_mapping.sku ? Number(productsConfig.field_mapping.sku) : undefined,
                            total: productsConfig.field_mapping.total ? Number(productsConfig.field_mapping.total) : undefined
                        }
                    }
                }
            })
        })
            .then(res => res.json())
            .then(data => setTestResult(data))
            .catch(err => console.error(err));
    };

    const handleSave = () => {
        let safeProveedorId = initialData?.proveedor_id;
        if (safeProveedorId === 'undefined' || safeProveedorId === undefined) {
            safeProveedorId = null as any;
        }

        const templateData: Partial<PDFTemplate> = {
            nombre: name,
            proveedor_id: safeProveedorId,
            activo: active,
            detect_keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
            header_config: headerConfig,
            products_config: {
                ...productsConfig,
                field_mapping: {
                    qty: Number(productsConfig.field_mapping.qty),
                    description: Number(productsConfig.field_mapping.description),
                    price: Number(productsConfig.field_mapping.price),
                    sku: productsConfig.field_mapping.sku ? Number(productsConfig.field_mapping.sku) : undefined,
                    total: productsConfig.field_mapping.total ? Number(productsConfig.field_mapping.total) : undefined
                }
            }
        };
        onSave(templateData);
    };

    // --- Custom Joyride Tooltip ---
    const CustomTooltip = ({
        continuous,
        index,
        step,
        backProps,
        closeProps,
        primaryProps,
        tooltipProps,
        isLastStep,
    }: TooltipRenderProps) => {
        return (
            <div {...tooltipProps} className="bg-white rounded-2xl border border-gray-100 p-5 max-w-[320px] font-sans">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        Paso {index + 1} de {tourSteps.length}
                    </h3>
                    <button {...closeProps} className="text-gray-400 hover:text-gray-700 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-sm text-gray-600 mb-5 leading-relaxed">
                    {step.content}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                        {index > 0 && (
                            <button
                                {...backProps}
                                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Atrás
                            </button>
                        )}
                    </div>

                    <button
                        {...primaryProps}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-500/30"
                    >
                        {isLastStep ? 'Terminar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        );
    };

    // --- Helper Functions for Visual Builder ---

    const generateRegexFromColumns = (cols: ColumnDef[]) => {
        let regexParts: string[] = [];
        let captureIndex = 1;
        let mapping: any = {};

        cols.forEach((col) => {
            if (col.type === 'text') {
                regexParts.push('(.+?)'); // Capture text (lazy)
                mapping.description = captureIndex;
                captureIndex++;
            } else if (col.type === 'number') {
                regexParts.push('([\\d.,]+)'); // Capture digits OR decimals (safer)
                mapping.qty = captureIndex;
                captureIndex++;
            } else if (col.type === 'price') {
                regexParts.push('([\\d.,]+)'); // Capture Price
                if (!mapping.price) mapping.price = captureIndex;
                else mapping.total = captureIndex;
                captureIndex++;
            } else if (col.type === 'sku') {
                regexParts.push('(\\S+)'); // Capture non-space
                mapping.sku = captureIndex;
                captureIndex++;
            } else {
                regexParts.push('\\S+'); // Ignore non-space block
            }
        });

        // Use \s+ for separators (at least one space)
        const regexInfo = `^${regexParts.join('\\s+')}$`;
        return { regex: regexInfo, mapping };
    };

    const addColumn = (type: ColumnType) => {
        const newCol: ColumnDef = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: type === 'text' ? 'Texto' : type === 'number' ? 'Número' : type === 'price' ? 'Precio' : 'Código'
        };
        setColumns([...columns, newCol]);
    };

    const removeColumn = (id: string) => {
        setColumns(columns.filter(c => c.id !== id));
    };

    const moveColumn = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index > 0) {
            const newCols = [...columns];
            [newCols[index], newCols[index - 1]] = [newCols[index - 1], newCols[index]];
            setColumns(newCols);
        } else if (direction === 'right' && index < columns.length - 1) {
            const newCols = [...columns];
            [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
            setColumns(newCols);
        }
    };


    // Guide Modal
    const GuideModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-white rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-blue-600" />
                        Guía Rápida
                    </h2>
                    <button type="button" onClick={() => setShowGuide(false)}><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600">
                        1. <strong>Inicio/Fin:</strong> Copia la palabra donde empieza y termina la lista desde el texto crudo.
                    </p>
                    <p className="text-gray-600">
                        2. <strong>Constructor de Columnas:</strong> Recrea el orden usando bloques de texto, número o precio.
                    </p>
                    <div className="flex justify-end mt-4">
                        <button type="button" onClick={() => setShowGuide(false)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Resume Bubble UI
    const ResumeBubble = () => {
        if (!showResumeBubble) return null;
        return (
            <button
                onClick={() => {
                    setShowResumeBubble(false);
                    const savedStep = localStorage.getItem('bazar-pdf-tour-last-step');
                    startTour(savedStep ? parseInt(savedStep, 10) : 0);
                }}
                className="fixed bottom-6 right-6 z-50 bg-white border border-blue-200 shadow-xl shadow-blue-500/20 rounded-full p-3 pr-5 flex items-center gap-3 animate-bounce hover:bg-blue-50 transition-colors group cursor-pointer"
            >
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-5 h-5 text-white ml-0.5" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 leading-tight">Retomar Tutorial</p>
                    <p className="text-[10px] text-gray-500 font-medium">Click para continuar</p>
                </div>
            </button>
        );
    };

    return (
        <>
            {showGuide && <GuideModal />}
            <ResumeBubble />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 relative">
                {/* Configuration Column */}
                <div className="space-y-6">

                    {/* 1. Basic Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden tour-basic-info">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-500" />
                                Información Básica
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => startTour()}
                                    className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                    <PlayCircle className="w-3 h-3" /> Tutorial
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Nombre del Formato</label>
                                <input
                                    type="text"
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="Ej: Factura Proveedor X"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                                    Palabras Clave <span className="text-gray-400 font-normal normal-case">(separadas por comas)</span>
                                </label>
                                <input
                                    type="text"
                                    value={keywords} onChange={e => setKeywords(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="Ej: CUIT 30-111, Nombre Empresa, Factura"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Configuration (Visual Builder / Debugger) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                        {/* DEBUGGER SECTION */}
                        {showDebug && debugLineInfo && (
                            <div className="mb-6 bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs border border-gray-700">
                                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <Bug className="w-4 h-4" /> Diagnóstico de Regex
                                </h4>
                                {debugLineInfo.status ? (
                                    <p className="text-red-400">{debugLineInfo.status}</p>
                                ) : (
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-gray-500 block">Línea Candidata:</span>
                                            <div className="bg-black/50 p-2 rounded text-white overflow-x-auto whitespace-pre">{debugLineInfo.line}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Regex Actual:</span>
                                            <div className="bg-black/50 p-2 rounded text-yellow-300 break-all">{productsConfig.line_regex}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Resultado:</span>
                                            <span className={`font-bold px-2 py-0.5 rounded ${debugLineInfo.match === 'MATCH' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                                {debugLineInfo.match}
                                            </span>
                                        </div>
                                        {Array.isArray(debugLineInfo.groups) && debugLineInfo.groups.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {debugLineInfo.groups.map((g: string, i: number) => (
                                                    <div key={i} className="bg-gray-800 p-1 px-2 rounded flex justify-between">
                                                        <span className="text-gray-500">Gr {i + 1}:</span>
                                                        <span className="text-white font-bold">"{g}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-purple-500" />
                                Reglas de Lectura
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {/* Start/End Markers */}
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 tour-reading-rules">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-purple-900 mb-1">Inicio</label>
                                        <input
                                            type="text"
                                            value={productsConfig.table_start_marker}
                                            onChange={e => setProductsConfig({ ...productsConfig, table_start_marker: e.target.value })}
                                            className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                                            placeholder="Ej: Descripción"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-purple-900 mb-1">Fin</label>
                                        <input
                                            type="text"
                                            value={productsConfig.table_end_marker}
                                            onChange={e => setProductsConfig({ ...productsConfig, table_end_marker: e.target.value })}
                                            className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                                            placeholder="Ej: Subtotal"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* VISUAL COLUMN BUILDER */}
                            {!showAdvanced ? (
                                <div className="tour-columns">
                                    <label className="block text-sm font-bold text-gray-800 mb-3">Constructor de Columnas</label>
                                    <div className="space-y-3">
                                        {columns.map((col, idx) => (
                                            <div key={col.id} className="flex items-center gap-2 group">
                                                <div className="w-6 text-center text-xs text-gray-400 font-mono">{idx + 1}</div>
                                                <div className={`flex-1 p-3 rounded-lg border flex items-center justify-between
                                                ${col.type === 'text' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                        col.type === 'number' ? 'bg-green-50 border-green-200 text-green-700' :
                                                            col.type === 'price' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                                col.type === 'sku' ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-gray-50 text-gray-400'}
                                            `}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                                                        {col.type === 'price' && (
                                                            <span className="text-[10px] bg-white bg-opacity-50 px-1.5 rounded">
                                                                {productsConfig.field_mapping.price === (idx + 1) ? 'Unitario' :
                                                                    productsConfig.field_mapping.total === (idx + 1) ? 'Total' : 'Precio'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={() => moveColumn(idx, 'left')} className="p-1 hover:bg-black/5 rounded"><ArrowRight className="w-3 h-3 rotate-180" /></button>
                                                        <button type="button" onClick={() => moveColumn(idx, 'right')} className="p-1 hover:bg-black/5 rounded"><ArrowRight className="w-3 h-3" /></button>
                                                        <button type="button" onClick={() => removeColumn(col.id)} className="p-1 hover:bg-red-100 text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button type="button" onClick={() => addColumn('text')} className="text-xs font-bold flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"><Plus className="w-3 h-3" /> Texto</button>
                                        <button type="button" onClick={() => addColumn('number')} className="text-xs font-bold flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Plus className="w-3 h-3" /> Cantidad</button>
                                        <button type="button" onClick={() => addColumn('price')} className="text-xs font-bold flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"><Plus className="w-3 h-3" /> Precio</button>
                                        <button type="button" onClick={() => addColumn('sku')} className="text-xs font-bold flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Plus className="w-3 h-3" /> SKU</button>
                                    </div>

                                    <div className="mt-6 pt-4 border-t text-center">
                                        <button type="button" onClick={() => setShowAdvanced(true)} className="text-xs text-gray-400 hover:text-gray-600 underline">Cambiar a modo Regex manual</button>
                                    </div>
                                </div>
                            ) : (
                                /* EXPERT MODE */
                                <div className="space-y-4 pt-4">
                                    <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-2 mb-4">
                                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                        <p className="text-xs text-yellow-700">Modo Experto Activado.</p>
                                        <button type="button" onClick={() => setShowAdvanced(false)} className="text-xs text-blue-600 underline ml-auto">Volver</button>
                                    </div>
                                    <input
                                        type="text"
                                        value={productsConfig.line_regex}
                                        onChange={e => setProductsConfig({ ...productsConfig, line_regex: e.target.value })}
                                        className="w-full mb-3 p-2 border rounded font-mono text-xs bg-gray-50"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="space-y-6">

                    {/* File Status Card */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm tour-test-file">
                        {loadedFile ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-red-500" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{loadedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(loadedFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                        Cambiar Archivo
                                        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Arrastra o selecciona un PDF de prueba</p>
                                <input type="file" accept=".pdf" onChange={handleFileUpload} className="block w-full text-xs text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 mt-4 mx-auto w-max
                            "/>
                            </div>
                        )}
                    </div>

                    {/* Live Preview Results */}
                    {isProcessing && (
                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="font-medium text-sm">Analizando PDF...</span>
                        </div>
                    )}

                    {!isProcessing && loadedFile && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="bg-white px-4 py-3 border-b flex justify-between items-center sticky top-0 tour-preview-tabs">
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setPreviewTab('datos')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${previewTab === 'datos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Datos Extraídos
                                    </button>
                                    <button
                                        onClick={() => setPreviewTab('pdf')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${previewTab === 'pdf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Documento PDF
                                    </button>
                                </div>
                                {testResult && previewTab === 'datos' && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${testResult.productos?.length > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {testResult.productos?.length || 0} productos encontrados
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto w-full flex flex-col p-4 bg-gray-50 h-full">
                                {previewTab === 'pdf' && pdfUrl ? (
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg shadow-sm"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {testResult ? (
                                            <>
                                                {testResult.error ? (
                                                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                                        <div className="flex items-center gap-2 mb-2 font-bold">
                                                            <AlertCircle className="w-5 h-5" />
                                                            Error en el Análisis
                                                        </div>
                                                        <p className="text-sm font-mono break-all">{testResult.error}</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Header Results */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className={`p-3 rounded-lg border ${testResult.numero_orden ? 'bg-white border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                                <span className="text-xs text-gray-500 block mb-1">N° Orden</span>
                                                                <span className="font-mono font-bold text-sm text-gray-900">{testResult.numero_orden || 'No detectado'}</span>
                                                            </div>
                                                            <div className={`p-3 rounded-lg border ${testResult.total ? 'bg-white border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                                <span className="text-xs text-gray-500 block mb-1">Total</span>
                                                                <span className="font-mono font-bold text-sm text-gray-900">${testResult.total || '0.00'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Products Results */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Productos</h4>
                                                            {testResult.productos?.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {testResult.productos.map((p: any, i: number) => (
                                                                        <div key={i} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm">
                                                                            <div className="font-medium text-gray-900 mb-1">{p.nombre}</div>
                                                                            <div className="flex justify-between items-center text-gray-500 text-xs">
                                                                                <div className="flex gap-3">
                                                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">Cant: {p.cantidad}</span>
                                                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">sku: {p.sku || '-'}</span>
                                                                                </div>
                                                                                <div className="font-mono">
                                                                                    <span className="mr-2">${p.precio_unitario}</span>
                                                                                    <span className="font-bold text-gray-900">${p.total}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-8 text-gray-400">
                                                                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                                    <p className="text-sm">No se encontraron productos.</p>
                                                                    <p className="text-xs mt-1">Usa el botón "Debug" para ver detalles.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 text-gray-400">
                                                <p>Esperando análisis...</p>
                                            </div>
                                        )}

                                        {/* Raw Text Debugger (Collapsed) */}
                                        {rawText && (
                                            <div className="mt-8 pt-4 border-t">
                                                <details className="text-xs text-gray-500">
                                                    <summary className="cursor-pointer hover:text-blue-600 font-medium mb-2">Ver Texto Crudo (Completo)</summary>
                                                    <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-[10px] h-40 overflow-y-auto whitespace-pre-wrap select-text">
                                                        {rawText}
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Valid Button sticky bottom */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10 lg:sticky lg:bottom-0 lg:col-span-2 lg:bg-transparent lg:border-none lg:p-0">
                    <div className="max-w-6xl mx-auto flex justify-end">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!name || (!initialData && !testResult?.productos?.length)}
                            className="tour-save bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {initialData ? 'Actualizar Plantilla' : 'Guardar Configuración'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
