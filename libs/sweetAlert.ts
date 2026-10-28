import { Messages } from './config';
import { getErrorMessage } from './types/common';

// sweetalert2 (~40KB) asosiy bundle'ga tushmasin — birinchi alert chaqirilganda yuklanadi
const loadSwal = async () => (await import('sweetalert2')).default;

export const sweetErrorHandling = async (err: unknown) => {
	await (await loadSwal()).fire({
		icon: 'error',
		text: getErrorMessage(err),
		showConfirmButton: false,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await (await loadSwal()).fire({
		position: 'center',
		icon: 'success',
		title: msg.replace('Definer: ', ''),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await (await loadSwal()).fire({
		title: msg,
		showClass: {
			popup: 'animate__bounceIn',
		},
		showConfirmButton: false,
		timer: duration,
	}).then();
};

export const sweetConfirmAlert = (msg: string) => {
	return new Promise(async (resolve, reject) => {
		await (await loadSwal()).fire({
			icon: 'question',
			text: msg,
			showClass: {
				popup: 'animate__bounceIn',
			},
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonColor: '#e92C28',
			cancelButtonColor: '#bdbdbd',
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve, reject) => {
		await (await loadSwal()).fire({
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			color: 'var(--text-1)',
			confirmButtonColor: '#e92C28',
			cancelButtonColor: '#bdbdbd',
			confirmButtonText: 'Login',
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await (await loadSwal()).fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	await (await loadSwal()).fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await (await loadSwal()).fire({
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	(await loadSwal()).fire(text);
};

export const sweetErrorHandlingForAdmin = async (err: unknown) => {
	const errorMessage = getErrorMessage(err, Messages.error1);
	await (await loadSwal()).fire({
		icon: 'error',
		text: errorMessage,
		showConfirmButton: false,
	});
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	const Toast = (await loadSwal()).mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: duration,
		timerProgressBar: true,
	});

	Toast.fire({
		icon: 'success',
		title: msg,
	}).then((data) => {
		if (enable_forward) {
			window.location.reload();
		}
	});
};

/** Variantlardan birini tanlash (masalan, shikoyat sababi). Bekor qilinsa null */
export const sweetSelectAlert = async (
	title: string,
	options: Record<string, string>,
	confirmText: string,
	cancelText: string,
): Promise<string | null> => {
	const response = await (await loadSwal()).fire({
		title,
		input: 'radio',
		inputOptions: options,
		inputValidator: (value) => (value ? null : title),
		customClass: { popup: 'swal-select-popup' },
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: cancelText,
		confirmButtonColor: '#e92C28',
		cancelButtonColor: '#bdbdbd',
	});
	return response.isConfirmed ? String(response.value) : null;
};
